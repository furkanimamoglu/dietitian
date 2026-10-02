const path = require('path');

const {Notification} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {pickMany, randomInt, dateAt} = require(path.join(__dirname, 'SeedUtils'));

const MESSAGES = [
    'Yeni beslenme planınız atandı.',
    'Yarın saat 14:00\'te randevunuz var.',
    'Size yeni bir egzersiz programı atandı.',
    'Diyetisyeniniz size yeni bir tarif önerdi.',
    'Su hedefinize ulaşmak için bir bardak su içmeyi unutmayın!',
    'Randevunuz onaylandı.',
    'Ödeme hatırlatması: faturanızın son ödeme tarihi yaklaşıyor.'
];

/**
 * NotificationSeeder - Danışanların mobil uygulamada göreceği bildirimler (bir kısmı okunmamış).
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Bildirim',

    async run(ctx) {
        const rows = [];

        for (const client of ctx.activeClients) {
            pickMany(MESSAGES, randomInt(3, 5)).forEach((message, index) => {
                const date = dateAt(-index * randomInt(1, 3), randomInt(9, 20), 0);
                rows.push({
                    client_id: client.id,
                    message,
                    isRead: index > 1,
                    createdAt: date,
                    updatedAt: date
                });
            });
        }

        await Notification.bulkCreate(rows, {transaction: ctx.transaction, silent: true});
        return rows.length;
    }
};
