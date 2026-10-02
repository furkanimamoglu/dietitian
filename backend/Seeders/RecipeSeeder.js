const path = require('path');

const {Recipe, RecipeCategory, RecipeAssignment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {pickMany, randomInt} = require(path.join(__dirname, 'SeedUtils'));

const RECIPES = {
    'Kahvaltılık': [
        {
            name: 'Yulaflı Muzlu Pankek', kcal: 320, protein: 14, karbonhidrat: 48, yag: 8,
            description: 'Şeker ilavesiz, lif açısından zengin pratik kahvaltı.',
            malzemeler: '4 yemek kaşığı yulaf ezmesi\n1 adet muz\n1 adet yumurta\n1 çay bardağı süt\nYarım çay kaşığı tarçın',
            hazirlanis: 'Tüm malzemeleri blenderdan geçirin. Yapışmaz tavada az ateşte iki yüzünü pişirin. Üzerine taze meyve ile servis edin.'
        },
        {
            name: 'Ispanaklı Omlet', kcal: 260, protein: 19, karbonhidrat: 4, yag: 18,
            description: 'Protein ve demir açısından zengin doyurucu omlet.',
            malzemeler: '2 adet yumurta\n1 avuç ıspanak\n30 g beyaz peynir\n1 tatlı kaşığı zeytinyağı',
            hazirlanis: 'Ispanağı zeytinyağında söndürün. Çırpılmış yumurtayı ve peyniri ekleyip kısık ateşte pişirin.'
        },
        {
            name: 'Chia Tohumlu Yoğurt Kasesi', kcal: 280, protein: 16, karbonhidrat: 30, yag: 10,
            description: 'Gece hazırlanıp sabah yenebilen pratik kahvaltı.',
            malzemeler: '1 kase yoğurt\n1 yemek kaşığı chia tohumu\n1 avuç yaban mersini\n1 tatlı kaşığı bal',
            hazirlanis: 'Yoğurt ve chia tohumunu karıştırıp buzdolabında bir gece bekletin. Sabah meyve ve bal ile servis edin.'
        }
    ],
    'Ana Yemek': [
        {
            name: 'Fırında Sebzeli Somon', kcal: 420, protein: 34, karbonhidrat: 14, yag: 24,
            description: 'Omega-3 açısından zengin, tek tepside hazırlanan ana yemek.',
            malzemeler: '150 g somon fileto\n1 adet kabak\n1 adet kırmızı biber\nYarım limon\n1 yemek kaşığı zeytinyağı',
            hazirlanis: 'Sebzeleri doğrayıp tepsiye yayın. Somonu üzerine yerleştirip limon ve zeytinyağı gezdirin. 200 derecede 20 dakika pişirin.'
        },
        {
            name: 'Zeytinyağlı Taze Fasulye', kcal: 210, protein: 6, karbonhidrat: 22, yag: 11,
            description: 'Klasik, hafif ve lifli bir Türk mutfağı yemeği.',
            malzemeler: '500 g taze fasulye\n1 adet soğan\n2 adet domates\n3 yemek kaşığı zeytinyağı',
            hazirlanis: 'Soğanı zeytinyağında kavurun. Fasulye ve rendelenmiş domatesi ekleyip kısık ateşte yumuşayana kadar pişirin.'
        },
        {
            name: 'Izgara Tavuk ve Bulgur Pilavı', kcal: 480, protein: 38, karbonhidrat: 46, yag: 14,
            description: 'Antrenman sonrası için dengeli protein ve karbonhidrat.',
            malzemeler: '150 g tavuk göğsü\n1 su bardağı bulgur\n1 adet sivri biber\nBaharatlar',
            hazirlanis: 'Tavuğu baharatlarla marine edip ızgarada pişirin. Bulguru biberle birlikte pilav olarak hazırlayın.'
        },
        {
            name: 'Mercimek Köftesi', kcal: 290, protein: 12, karbonhidrat: 44, yag: 8,
            description: 'Bitkisel protein kaynağı, vejetaryen dostu tarif.',
            malzemeler: '1 su bardağı kırmızı mercimek\n1 su bardağı ince bulgur\n1 demet maydanoz\n1 yemek kaşığı salça',
            hazirlanis: 'Mercimeği haşlayıp sıcakken bulguru ekleyin. Demlenince salça ve yeşillikleri ekleyip yoğurun ve şekil verin.'
        }
    ],
    'Salata': [
        {
            name: 'Kinoalı Akdeniz Salatası', kcal: 340, protein: 11, karbonhidrat: 38, yag: 16,
            description: 'Öğle yemeği için doyurucu ve renkli salata.',
            malzemeler: 'Yarım su bardağı kinoa\n1 adet salatalık\n5 adet çeri domates\n30 g beyaz peynir\nZeytinyağı ve limon',
            hazirlanis: 'Kinoayı haşlayıp soğutun. Doğranmış sebzeler ve peynirle karıştırıp sosla servis edin.'
        },
        {
            name: 'Ton Balıklı Nohut Salatası', kcal: 380, protein: 28, karbonhidrat: 30, yag: 14,
            description: 'Yüksek proteinli, pratik salata.',
            malzemeler: '1 kutu ton balığı (süzülmüş)\n1 su bardağı haşlanmış nohut\n1 adet kırmızı soğan\nRoka, limon',
            hazirlanis: 'Tüm malzemeleri geniş bir kapta karıştırın. Limon ve az zeytinyağı ile tatlandırın.'
        }
    ],
    'Ara Öğün': [
        {
            name: 'Fıstık Ezmeli Elma Dilimleri', kcal: 190, protein: 5, karbonhidrat: 22, yag: 9,
            description: 'Tatlı krizlerine karşı pratik ara öğün.',
            malzemeler: '1 adet elma\n1 yemek kaşığı şekersiz fıstık ezmesi\nTarçın',
            hazirlanis: 'Elmayı dilimleyin, üzerine fıstık ezmesi sürüp tarçın serpin.'
        },
        {
            name: 'Fırında Baharatlı Nohut', kcal: 160, protein: 8, karbonhidrat: 24, yag: 4,
            description: 'Cips yerine çıtır ve lifli atıştırmalık.',
            malzemeler: '1 su bardağı haşlanmış nohut\n1 tatlı kaşığı zeytinyağı\nKırmızı toz biber, kimyon',
            hazirlanis: 'Nohutları kurulayıp baharat ve yağla karıştırın. 200 derecede 25 dakika çıtırlaşana kadar pişirin.'
        }
    ],
    'Tatlı': [
        {
            name: 'Şekersiz Muzlu Dondurma', kcal: 150, protein: 3, karbonhidrat: 34, yag: 1,
            description: 'Tek malzemeli, rafine şeker içermeyen tatlı.',
            malzemeler: '2 adet olgun muz\nİsteğe bağlı kakao',
            hazirlanis: 'Muzları dilimleyip dondurun. Mutfak robotunda krema kıvamına gelene kadar çekin.'
        }
    ]
};

const ASSIGNMENT_NOTES = ['Haftada 2 kez tüketebilirsin.', 'Kahvaltıda alternatif olarak dene.', 'Antrenman günlerinde tercih et.', null];

/**
 * RecipeSeeder - Tarif kategorileri, tarifler ve aktif danışanlara tarif atamaları.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Tarif',

    async run(ctx) {
        const t = ctx.transaction;
        ctx.recipes = [];

        for (const [categoryName, recipes] of Object.entries(RECIPES)) {
            const category = await RecipeCategory.create({name: categoryName, dietitian_id: ctx.dietitian.id}, {transaction: t});
            const created = await Recipe.bulkCreate(recipes.map((recipe, index) => ({
                ...recipe,
                dietitian_id: ctx.dietitian.id,
                category_id: category.id,
                isPublic: index % 2 === 0
            })), {transaction: t, returning: true});
            ctx.recipes.push(...created);
        }

        const assignments = ctx.activeClients.flatMap((client, index) =>
            pickMany(ctx.recipes, randomInt(2, 4)).map(recipe => ({
                dietitian_id: ctx.dietitian.id,
                client_id: client.id,
                recipe_id: recipe.id,
                note: ASSIGNMENT_NOTES[index % ASSIGNMENT_NOTES.length]
            }))
        );
        await RecipeAssignment.bulkCreate(assignments, {transaction: t});

        return `${ctx.recipes.length} tarif, ${assignments.length} atama`;
    }
};
