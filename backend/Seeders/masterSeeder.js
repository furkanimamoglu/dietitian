const path = require('path');
const {Op} = require('sequelize');

const config = require(path.join(__dirname, '..', 'Utils', 'Config'));
const {logger, serializeError} = require(path.join(__dirname, '..', 'Utils', 'Logger'));
const Models = require(path.join(__dirname, '..', 'Model', 'MainModel'));

const DietitianSeeder = require(path.join(__dirname, 'DietitianSeeder'));
const ClientSeeder = require(path.join(__dirname, 'ClientSeeder'));

/*
 * masterSeeder - Uygulamayı demo verisiyle dolduran tüm seeder'ları sırayla çalıştırır.
 *
 * Kullanım (backend klasöründe):
 *   npm run seed          -> Demo veri yoksa oluşturur.
 *   npm run seed:fresh    -> Mevcut demo veriyi silip yeniden oluşturur (diğer kullanıcıların verisine dokunmaz).
 *
 * Seeder'lar tek bir transaction içinde çalışır; herhangi biri hata verirse hiçbir kayıt yazılmaz.
 * Sıra önemlidir: sonraki seeder'lar öncekilerin ctx'e koyduğu kayıtları kullanır.
 */
const SEEDERS = [
    DietitianSeeder,
    ClientSeeder,
    require(path.join(__dirname, 'AnamnesSeeder')),
    require(path.join(__dirname, 'MeasurementSeeder')),
    require(path.join(__dirname, 'WaterSeeder')),
    require(path.join(__dirname, 'AppointmentSeeder')),
    require(path.join(__dirname, 'PackageSeeder')),
    require(path.join(__dirname, 'InvoiceSeeder')),
    require(path.join(__dirname, 'RecipeSeeder')),
    require(path.join(__dirname, 'ExerciseSeeder')),
    require(path.join(__dirname, 'NutritionSeeder')),
    require(path.join(__dirname, 'MessageSeeder')),
    require(path.join(__dirname, 'NotificationSeeder')),
    require(path.join(__dirname, 'NoteSeeder'))
];

const {sequelize, Dietitian, Client} = Models;

/**
 * Demo diyetisyene ve danışanlarına ait tüm kayıtları, foreign key sırasına uygun şekilde siler.
 */
async function cleanDemoData(transaction) {
    const dietitian = await Dietitian.findOne({where: {phoneNumber: DietitianSeeder.DEMO_DIETITIAN.phoneNumber}, transaction});
    if (!dietitian) return false;

    const dietitian_id = dietitian.id;
    const clientIds = (await Client.findAll({where: {dietitian_id}, attributes: ['id'], transaction})).map(client => client.id);
    const packageIds = (await Models.Package.findAll({where: {dietitian_id}, attributes: ['id'], transaction})).map(pkg => pkg.id);
    const options = (where) => ({where, transaction});

    // Önce danışana bağlı kayıtlar.
    for (const model of ['Water', 'Notification', 'Measurement', 'Anamnes', 'BloodTest', 'Message', 'Invoice',
        'Appointment', 'RecipeAssignment', 'ExerciseAssignment', 'NutritionAssignment']) {
        await Models[model].destroy(options({client_id: {[Op.in]: clientIds}}));
    }

    // Sonra diyetisyene bağlı içerikler (alt tablolar üst tablolardan önce).
    await Models.PackageItems.destroy(options({package_id: {[Op.in]: packageIds}}));
    for (const model of ['Message', 'Invoice', 'Appointment', 'RecipeAssignment', 'Package', 'Recipe', 'RecipeCategory',
        'Exercise', 'ExerciseCategory', 'NutritionPlan', 'NutritionCategory', 'Notes']) {
        await Models[model].destroy(options({dietitian_id}));
    }

    await Client.destroy(options({dietitian_id}));
    await dietitian.destroy({transaction});
    return true;
}

/**
 * Demo veriyi oluşturur. Demo veri zaten varsa (fresh değilse) hiçbir şey yapmaz.
 * @param {object} options
 * @param {boolean} options.fresh - Mevcut demo veriyi silip yeniden oluşturur.
 * @param {boolean} options.sync - Önce sequelize.sync() çalıştırır (app.js zaten sync ettiği için orada false).
 */
async function seed({fresh = false, sync = true} = {}) {
    if (config.nodeEnv === 'production') {
        throw new Error('Seeder production ortamında çalıştırılamaz. .env dosyasında NODE_ENV=development olmalı.');
    }

    // Tablolar yoksa oluşturur; DietitianSubPackage afterSync hook'u abonelik paketlerini ekler.
    if (sync) {
        await sequelize.sync();
    }

    await sequelize.transaction(async (transaction) => {
        if (fresh && await cleanDemoData(transaction)) {
            logger.info('Mevcut demo veri silindi.');
        }

        const existing = await Dietitian.findOne({where: {phoneNumber: DietitianSeeder.DEMO_DIETITIAN.phoneNumber}, transaction});
        if (existing) {
            logger.info('Demo veri zaten mevcut, seeder atlandı. Yeniden oluşturmak için: npm run seed:fresh');
            return;
        }

        const ctx = {transaction};
        for (const seeder of SEEDERS) {
            const result = await seeder.run(ctx);
            logger.info(`${seeder.name} seeder tamamlandı: ${result}`);
        }

        logger.info(
            `Demo veri hazır. Diyetisyen girişi: ${DietitianSeeder.DEMO_DIETITIAN.phoneNumber} / ${DietitianSeeder.DEMO_DIETITIAN.password} | ` +
            `Danışan girişi: ${ctx.clients[0].phoneNumber} / ${ClientSeeder.DEMO_CLIENT_PASSWORD}`
        );
    });
}

module.exports = {seed, cleanDemoData};

// Komut satırından çalıştırıldığında (npm run seed / seed:fresh).
if (require.main === module) {
    seed({fresh: process.argv.includes('--fresh')})
        .then(() => sequelize.close())
        .catch(async (error) => {
            logger.error({err: serializeError(error)}, 'Seeder başarısız oldu, hiçbir kayıt yazılmadı.');
            await sequelize.close();
            process.exitCode = 1;
        });
}
