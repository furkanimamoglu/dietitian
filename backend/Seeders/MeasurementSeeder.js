const path = require('path');

const {Measurement} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {randomInt, dateAt} = require(path.join(__dirname, 'SeedUtils'));

// Her danışan için 2 haftada bir, toplam 6 ölçüm (en eskisi ~10 hafta önce).
const MEASUREMENT_COUNT = 6;
const INTERVAL_DAYS = 14;

/**
 * MeasurementSeeder - Başlangıç kilosundan güncel kiloya ilerleyen ölçüm geçmişi oluşturur.
 * Grafiklerde gerçekçi bir trend görünmesi için çevre ölçüleri kiloyla birlikte değişir.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Ölçüm',

    async run(ctx) {
        const rows = [];

        for (const client of ctx.clients) {
            const profile = ctx.clientProfiles.get(client.id);
            const isMale = profile.gender === 'Erkek';

            for (let i = 0; i < MEASUREMENT_COUNT; i++) {
                const progress = i / (MEASUREMENT_COUNT - 1);
                const kilo = Math.round(profile.startKg + (profile.currentKg - profile.startKg) * progress);
                const delta = kilo - profile.currentKg;
                const date = dateAt(-(MEASUREMENT_COUNT - 1 - i) * INTERVAL_DAYS, 10, 0);

                rows.push({
                    client_id: client.id,
                    boy: profile.heightCm,
                    kilo,
                    bel: (isMale ? 92 : 78) + delta + randomInt(-1, 1),
                    kalca: (isMale ? 102 : 104) + Math.round(delta * 0.8),
                    gogus: (isMale ? 104 : 94) + Math.round(delta * 0.6),
                    digerbel: (isMale ? 96 : 84) + delta,
                    kol: (isMale ? 33 : 29) + Math.round(delta * 0.3),
                    bacak: (isMale ? 58 : 56) + Math.round(delta * 0.4),
                    yag: Math.max(12, (isMale ? 24 : 31) + Math.round(delta * 0.7)),
                    kas: Math.round(kilo * (isMale ? 0.42 : 0.36)),
                    su: randomInt(isMale ? 55 : 50, isMale ? 60 : 55),
                    createdAt: date,
                    updatedAt: date
                });
            }
        }

        await Measurement.bulkCreate(rows, {transaction: ctx.transaction, silent: true});
        return rows.length;
    }
};
