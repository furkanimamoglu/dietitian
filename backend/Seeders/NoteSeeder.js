const path = require('path');

const {Notes} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

const NOTES = [
    'Cuma günü kan tahlili sonuçları gelecek danışanları ara.',
    'Yeni tarif kategorisi: glutensiz tarifler ekle.',
    'Ay sonu fatura kontrolü yapılacak.',
    'Kongre: 15 Kasım, sporcu beslenmesi oturumu.',
    'Instagram için haftalık sağlıklı atıştırmalık paylaşımı hazırla.'
];

/**
 * NoteSeeder - Diyetisyenin dashboard'daki kişisel notları.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Not',

    async run(ctx) {
        await Notes.bulkCreate(
            NOTES.map(noteContent => ({dietitian_id: ctx.dietitian.id, noteContent})),
            {transaction: ctx.transaction}
        );
        return NOTES.length;
    }
};
