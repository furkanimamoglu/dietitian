const path = require('path');

const {Dietitian} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));
const {dateAt} = require(path.join(__dirname, 'SeedUtils'));

// Demo diyetisyen hesabı. masterSeeder bu telefon numarasıyla demo verinin var olup olmadığını kontrol eder.
const DEMO_DIETITIAN = {
    name: 'Dyt. Elif Yılmaz',
    phoneNumber: 5550000001,
    email: 'demo.diyetisyen@example.com',
    password: 'demo1234'
};

/**
 * DietitianSeeder - Demo diyetisyeni premium abonelikle oluşturur.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Diyetisyen',
    DEMO_DIETITIAN,

    async run(ctx) {
        ctx.dietitian = await Dietitian.create({
            ...DEMO_DIETITIAN,
            role: DIETITIAN,
            gender: 'Kadın',
            status: true,
            subscription_type: 'premium',
            subscription_start_date: dateAt(-60),
            subscription_end_date: dateAt(305),
            ipAddress: '127.0.0.1',
            kvkkApproval: true,
            kullaniciSozlesmesiApproval: true,
            SMSApproval: true,
            MailApproval: true,
            NotificationApproval: true
        }, {transaction: ctx.transaction});

        return 1;
    }
};
