const path = require('path');

const {Package, PackageItems} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

// type değerleri frontend Finans sayfasındaki paket tipleriyle aynı olmalı.
const PACKAGES = [
    {
        name: 'Tek Seans Danışmanlık',
        type: 'Seanslık',
        price: '750',
        description: 'Tek seferlik yüz yüze veya online beslenme danışmanlığı.',
        items: ['45 dakika görüşme', 'Vücut analizi', 'Kişiye özel öneriler']
    },
    {
        name: 'Aylık Takip Paketi',
        type: 'Aylık',
        price: '2500',
        description: 'Bir ay boyunca haftalık kontrollerle kişiye özel beslenme programı.',
        items: ['4 görüşme', 'Haftalık beslenme planı', 'Mesaj ile destek', 'Vücut analizi']
    },
    {
        name: '3 Aylık Dönüşüm Paketi',
        type: '3 Aylık',
        price: '6500',
        description: 'Kalıcı alışkanlık kazanmak isteyenler için üç aylık yoğun program.',
        items: ['12 görüşme', 'Haftalık beslenme planı', 'Egzersiz programı', 'Tarif önerileri', 'Mesaj ile destek']
    },
    {
        name: '6 Aylık Yaşam Tarzı Paketi',
        type: '6 Aylık',
        price: '11500',
        description: 'Uzun vadeli takip, kan tahlili değerlendirmesi ve yaşam tarzı koçluğu.',
        items: ['24 görüşme', 'Kan tahlili değerlendirmesi', 'Egzersiz programı', 'Tarif önerileri', '7/24 mesaj desteği']
    }
];

/**
 * PackageSeeder - Diyetisyenin sattığı danışmanlık paketleri ve paket içerikleri.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Paket',

    async run(ctx) {
        ctx.packages = [];
        let itemCount = 0;

        for (const {items, ...data} of PACKAGES) {
            const pkg = await Package.create({...data, dietitian_id: ctx.dietitian.id}, {transaction: ctx.transaction});
            await PackageItems.bulkCreate(items.map(name => ({package_id: pkg.id, name})), {transaction: ctx.transaction});
            ctx.packages.push(pkg);
            itemCount += items.length;
        }

        return `${ctx.packages.length} paket, ${itemCount} içerik`;
    }
};
