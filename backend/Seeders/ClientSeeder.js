const path = require('path');

const {Client} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));

// Tüm demo danışanların şifresi aynı. İlk danışan mobil uygulama demo girişi için kullanılabilir.
const DEMO_CLIENT_PASSWORD = 'demo1234';

// startKg / targetKg: ölçüm geçmişi bu değerler arasında üretilir.
const CLIENTS = [
    {name: 'Ayşe Demir', email: 'ayse.demir', gender: 'Kadın', age: 34, heightCm: 165, startKg: 78, currentKg: 71},
    {name: 'Mehmet Kaya', email: 'mehmet.kaya', gender: 'Erkek', age: 42, heightCm: 178, startKg: 98, currentKg: 91},
    {name: 'Zeynep Çelik', email: 'zeynep.celik', gender: 'Kadın', age: 27, heightCm: 168, startKg: 64, currentKg: 61},
    {name: 'Ahmet Şahin', email: 'ahmet.sahin', gender: 'Erkek', age: 38, heightCm: 182, startKg: 88, currentKg: 84},
    {name: 'Elif Arslan', email: 'elif.arslan', gender: 'Kadın', age: 31, heightCm: 160, startKg: 69, currentKg: 63},
    {name: 'Mustafa Yıldız', email: 'mustafa.yildiz', gender: 'Erkek', age: 51, heightCm: 174, startKg: 102, currentKg: 94},
    {name: 'Selin Aydın', email: 'selin.aydin', gender: 'Kadın', age: 24, heightCm: 170, startKg: 52, currentKg: 56},
    {name: 'Burak Öztürk', email: 'burak.ozturk', gender: 'Erkek', age: 29, heightCm: 185, startKg: 72, currentKg: 77},
    {name: 'Merve Koç', email: 'merve.koc', gender: 'Kadın', age: 36, heightCm: 163, startKg: 74, currentKg: 70},
    {name: 'Emre Polat', email: 'emre.polat', gender: 'Erkek', age: 45, heightCm: 176, startKg: 91, currentKg: 86},
    {name: 'Deniz Kurt', email: 'deniz.kurt', gender: 'Kadın', age: 22, heightCm: 158, startKg: 60, currentKg: 59, status: 'Pasif'},
    {name: 'Can Erdoğan', email: 'can.erdogan', gender: 'Erkek', age: 33, heightCm: 180, startKg: 85, currentKg: 84, status: 'Pasif'}
];

const DIETITIAN_NOTES = [
    'Akşam atıştırmalarına dikkat edilmeli.',
    'Haftada 3 gün yürüyüş hedefi var.',
    'Laktoz hassasiyeti mevcut.',
    'Motivasyonu yüksek, düzenli takip ediyor.',
    'Su tüketimi artırılmalı.',
    'İnsülin direnci var, düşük glisemik indeksli beslenme.'
];

/**
 * ClientSeeder - Demo diyetisyene bağlı danışanları oluşturur.
 * Ölçüm ve diğer seeder'ların kullanması için profil bilgileri ctx.clientProfiles'ta tutulur.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Danışan',
    CLIENTS,
    DEMO_CLIENT_PASSWORD,

    async run(ctx) {
        ctx.clients = [];
        ctx.clientProfiles = new Map();

        for (const [index, profile] of CLIENTS.entries()) {
            const client = await Client.create({
                dietitian_id: ctx.dietitian.id,
                name: profile.name,
                email: `${profile.email}@example.com`,
                phoneNumber: 5550000101 + index,
                password: DEMO_CLIENT_PASSWORD,
                role: CLIENT,
                gender: profile.gender,
                age: profile.age,
                status: profile.status || 'Aktif',
                dietitianNotes: DIETITIAN_NOTES[index % DIETITIAN_NOTES.length],
                dailyWaterIntake: profile.gender === 'Erkek' ? 3000 : 2500,
                kvkkApproval: true,
                kullaniciSozlesmesiApproval: true,
                SMSApproval: index % 3 !== 0,
                MailApproval: true,
                NotificationApproval: true
            }, {transaction: ctx.transaction});

            ctx.clients.push(client);
            ctx.clientProfiles.set(client.id, profile);
        }

        ctx.activeClients = ctx.clients.filter(client => client.status === 'Aktif');
        return ctx.clients.length;
    }
};
