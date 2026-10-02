const path = require('path');

const {Message} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {DIETITIAN, CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));
const {dateAt} = require(path.join(__dirname, 'SeedUtils'));

// [gönderen, mesaj, kaç gün önce, saat]. Son danışan mesajları okunmamış bırakılır.
const CONVERSATIONS = [
    [
        [CLIENT, 'Merhaba hocam, bu hafta 1.5 kilo verdim!', 3, 9],
        [DIETITIAN, 'Harika haber, tebrikler! Su tüketimine de dikkat etmeye devam.', 3, 10],
        [CLIENT, 'Akşam yemeğinde somon yerine tavuk yiyebilir miyim?', 0, 8],
        [CLIENT, 'Bir de cumartesi düğüne gideceğim, nasıl idare edeyim?', 0, 8]
    ],
    [
        [DIETITIAN, 'Yeni beslenme planınızı sisteme yükledim, inceleyebilirsiniz.', 5, 11],
        [CLIENT, 'Teşekkürler, kahvaltıdaki yulafı çok sevdim.', 5, 13],
        [DIETITIAN, 'Ne güzel! Ara öğünleri atlamamaya çalışın.', 4, 9],
        [CLIENT, 'Randevumu bir gün erteleyebilir miyiz?', 0, 10]
    ],
    [
        [CLIENT, 'Spor sonrası ne yemeliyim?', 2, 18],
        [DIETITIAN, 'Antrenmandan sonraki 1 saat içinde protein ve karbonhidrat içeren bir öğün idealdir. Tarifler bölümüne birkaç öneri ekledim.', 2, 19],
        [CLIENT, 'Süper, teşekkür ederim!', 2, 19]
    ],
    [
        [DIETITIAN, 'Kan tahlili sonuçlarınızı getirmeyi unutmayın.', 7, 10],
        [CLIENT, 'Tamam hocam, perşembe getiriyorum.', 7, 12],
        [CLIENT, 'Sonuçları sisteme yükledim.', 1, 15]
    ],
    [
        [CLIENT, 'Bu hafta tatlı krizlerim çok arttı :(', 1, 21],
        [DIETITIAN, 'Çok normal, akşamları fıstık ezmeli elma dilimlerini deneyebilirsin. Uyku düzenine de bakalım.', 1, 22]
    ],
    [
        [DIETITIAN, 'Ölçüm sonuçlarınız çok iyi, bel çevrenizde 3 cm azalma var.', 10, 16],
        [CLIENT, 'Çok mutlu oldum, motivasyonum arttı!', 10, 17]
    ]
];

/**
 * MessageSeeder - Diyetisyen ile aktif danışanlar arasında mesajlaşma geçmişi.
 * Bazı danışanların son mesajları okunmamış; header'daki mesaj sayacı dolu görünür.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Mesaj',

    async run(ctx) {
        const rows = [];

        CONVERSATIONS.forEach((conversation, index) => {
            const client = ctx.activeClients[index];
            const lastDietitianIndex = conversation.map(([sender]) => sender).lastIndexOf(DIETITIAN);

            conversation.forEach(([sender, message, daysAgo, hour], messageIndex) => {
                const date = dateAt(-daysAgo, hour, messageIndex * 7);
                rows.push({
                    dietitian_id: ctx.dietitian.id,
                    client_id: client.id,
                    sender,
                    message,
                    // Diyetisyenin son cevabından sonraki danışan mesajları okunmamış.
                    isRead: !(sender === CLIENT && messageIndex > lastDietitianIndex && index < 4),
                    createdAt: date,
                    updatedAt: date
                });
            });
        });

        await Message.bulkCreate(rows, {transaction: ctx.transaction, silent: true});
        return rows.length;
    }
};
