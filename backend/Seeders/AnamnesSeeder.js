const path = require('path');

const {Anamnes} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

// Danışanlara sırayla dağıtılan anamnez şablonları (frontend Danisan sayfasındaki alanlarla aynı yapı).
const TEMPLATES = [
    {
        saglik_bilgileri: {
            kronik_hastaliklar: 'İnsülin direnci',
            alerjiler: 'Yok',
            ilac_kullanimi: 'Metformin 500 mg',
            gecmis_ameliyatlar: 'Yok',
            aile_saglik_gecmisi: 'Annede tip 2 diyabet',
            uyku: '6-7 saat, sık uyanma'
        },
        diyet_aliskanliklari: {
            gunluk_su_tuketimi: '1.5 litre',
            ogun_duzeni: '3 ana öğün, kahvaltıyı bazen atlıyor',
            favori_yiyecekler: 'Makarna, pilav, börek',
            sevilmeyen_yiyecekler: 'Brokoli, balık',
            atistirmalik_aliskanliklari: 'Akşamları çikolata ve kuruyemiş',
            disarida_yemek: 'Haftada 2-3 kez'
        },
        fiziksel_aktivite: {
            aktivite_seviyesi: 'Düşük',
            egzersiz_aliskanliklari: 'Düzenli egzersiz yok',
            sevdigi_sporlar: 'Yürüyüş',
            meslek_ve_aktivite_durumu: 'Ofis çalışanı, gün boyu masa başında'
        },
        ozel_notlar: 'Tatlı krizleri akşam saatlerinde yoğunlaşıyor.'
    },
    {
        saglik_bilgileri: {
            kronik_hastaliklar: 'Hipertansiyon',
            alerjiler: 'Penisilin',
            ilac_kullanimi: 'Tansiyon ilacı',
            gecmis_ameliyatlar: 'Apandisit (2015)',
            aile_saglik_gecmisi: 'Babada kalp rahatsızlığı',
            uyku: '7 saat, düzenli'
        },
        diyet_aliskanliklari: {
            gunluk_su_tuketimi: '2 litre',
            ogun_duzeni: '2 ana öğün, 1 ara öğün',
            favori_yiyecekler: 'Kırmızı et, ekmek',
            sevilmeyen_yiyecekler: 'Kabak',
            atistirmalik_aliskanliklari: 'Cips, tuzlu kraker',
            disarida_yemek: 'İş yemekleri nedeniyle sık'
        },
        fiziksel_aktivite: {
            aktivite_seviyesi: 'Orta',
            egzersiz_aliskanliklari: 'Haftada 2 gün yürüyüş',
            sevdigi_sporlar: 'Futbol, yüzme',
            meslek_ve_aktivite_durumu: 'Satış temsilcisi, gün içinde hareketli'
        },
        ozel_notlar: 'Tuz tüketimi azaltılmalı.'
    },
    {
        saglik_bilgileri: {
            kronik_hastaliklar: 'Yok',
            alerjiler: 'Laktoz intoleransı',
            ilac_kullanimi: 'D vitamini takviyesi',
            gecmis_ameliyatlar: 'Yok',
            aile_saglik_gecmisi: 'Belirgin bir durum yok',
            uyku: '8 saat'
        },
        diyet_aliskanliklari: {
            gunluk_su_tuketimi: '2.5 litre',
            ogun_duzeni: '3 ana öğün, 2 ara öğün',
            favori_yiyecekler: 'Sebze yemekleri, salata',
            sevilmeyen_yiyecekler: 'Sakatat',
            atistirmalik_aliskanliklari: 'Meyve, yoğurt',
            disarida_yemek: 'Haftada 1 kez'
        },
        fiziksel_aktivite: {
            aktivite_seviyesi: 'Yüksek',
            egzersiz_aliskanliklari: 'Haftada 4 gün spor salonu',
            sevdigi_sporlar: 'Pilates, koşu',
            meslek_ve_aktivite_durumu: 'Öğrenci'
        },
        ozel_notlar: 'Kas kütlesini artırma hedefi var.'
    },
    {
        saglik_bilgileri: {
            kronik_hastaliklar: 'Hashimoto tiroiditi',
            alerjiler: 'Yok',
            ilac_kullanimi: 'Levotiroksin',
            gecmis_ameliyatlar: 'Sezaryen',
            aile_saglik_gecmisi: 'Annede tiroid rahatsızlığı',
            uyku: '6 saat, yorgun uyanıyor'
        },
        diyet_aliskanliklari: {
            gunluk_su_tuketimi: '1 litre',
            ogun_duzeni: 'Düzensiz',
            favori_yiyecekler: 'Hamur işleri, tatlı',
            sevilmeyen_yiyecekler: 'Baklagiller',
            atistirmalik_aliskanliklari: 'Bisküvi, kek',
            disarida_yemek: 'Nadiren'
        },
        fiziksel_aktivite: {
            aktivite_seviyesi: 'Düşük',
            egzersiz_aliskanliklari: 'Yok',
            sevdigi_sporlar: 'Yoga',
            meslek_ve_aktivite_durumu: 'Ev hanımı, iki çocuk annesi'
        },
        ozel_notlar: 'Gluten tüketimi azaltılarak takip edilecek.'
    }
];

/**
 * AnamnesSeeder - Her danışana bir anamnez kaydı oluşturur.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Anamnez',

    async run(ctx) {
        const rows = ctx.clients.map((client, index) => ({
            dietitian_id: ctx.dietitian.id,
            client_id: client.id,
            ...TEMPLATES[index % TEMPLATES.length]
        }));

        await Anamnes.bulkCreate(rows, {transaction: ctx.transaction});
        return rows.length;
    }
};
