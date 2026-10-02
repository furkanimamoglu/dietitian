const path = require('path');

const {NutritionCategory, NutritionPlan, NutritionAssignment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {randomInt, dateOnly} = require(path.join(__dirname, 'SeedUtils'));

// mealPlan yapısı frontend MealPlanEditor ile aynı:
// { [gün]: { [öğün]: { info: {image, time}, Alternatif: [{name, portion, addedBy}] } } }
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const MEAL_TIMES = {'Kahvaltı': '08:00', 'Öğle Yemeği': '13:00', 'Aparatif': '16:00', 'Akşam Yemeği': '19:00'};
const MAIN_MENU = 'Alternatif';

// Her öğün için seçenekler; günlere sırayla dağıtılır. Her seçenek [isim, porsiyon] listesi.
const MENUS = {
    'Kilo Verme': {
        'Kahvaltı': [
            [['Haşlanmış yumurta', '2 adet'], ['Beyaz peynir', '30 g'], ['Domates, salatalık', 'Bol'], ['Tam buğday ekmeği', '1 dilim']],
            [['Yulaf ezmesi', '4 yemek kaşığı'], ['Süt', '1 su bardağı'], ['Ceviz', '2 adet']],
            [['Ispanaklı omlet', '2 yumurta'], ['Zeytin', '5 adet'], ['Yeşillik', 'Bol']]
        ],
        'Öğle Yemeği': [
            [['Izgara tavuk', '120 g'], ['Mevsim salata', '1 kase'], ['Yoğurt', '1 kase']],
            [['Mercimek çorbası', '1 kase'], ['Ton balıklı salata', '1 porsiyon']],
            [['Zeytinyağlı sebze yemeği', '1 porsiyon'], ['Cacık', '1 kase'], ['Tam buğday ekmeği', '1 dilim']]
        ],
        'Aparatif': [
            [['Elma', '1 adet'], ['Badem', '10 adet']],
            [['Kefir', '1 su bardağı']],
            [['Havuç', '1 adet'], ['Lor peyniri', '2 yemek kaşığı']]
        ],
        'Akşam Yemeği': [
            [['Fırında somon', '150 g'], ['Buharda brokoli', '1 porsiyon']],
            [['Etli kuru fasulye', '1 porsiyon'], ['Bulgur pilavı', '3 yemek kaşığı'], ['Salata', '1 kase']],
            [['Izgara köfte', '4 adet'], ['Közlenmiş sebze', '1 porsiyon'], ['Ayran', '1 bardak']]
        ]
    },
    'Kilo Alma': {
        'Kahvaltı': [
            [['Menemen', '2 yumurta'], ['Kaşar peyniri', '40 g'], ['Ekmek', '2 dilim'], ['Bal', '1 yemek kaşığı']],
            [['Yulaflı muzlu pankek', '1 porsiyon'], ['Fıstık ezmesi', '1 yemek kaşığı'], ['Süt', '1 su bardağı']]
        ],
        'Öğle Yemeği': [
            [['Tavuklu makarna', '1 porsiyon'], ['Yoğurt', '1 kase'], ['Salata', '1 kase']],
            [['Kıymalı pide', '1 porsiyon'], ['Ayran', '1 bardak']]
        ],
        'Aparatif': [
            [['Muz', '1 adet'], ['Fındık', '20 adet'], ['Süt', '1 su bardağı']],
            [['Granola', '1 kase'], ['Yoğurt', '1 kase']]
        ],
        'Akşam Yemeği': [
            [['Et sote', '150 g'], ['Pirinç pilavı', '6 yemek kaşığı'], ['Cacık', '1 kase']],
            [['Fırında tavuk but', '2 adet'], ['Patates püresi', '1 porsiyon']]
        ]
    },
    'Sağlıklı Yaşam': {
        'Kahvaltı': [
            [['Chia tohumlu yoğurt', '1 kase'], ['Meyve', '1 porsiyon']],
            [['Haşlanmış yumurta', '1 adet'], ['Peynir', '30 g'], ['Ekmek', '1 dilim'], ['Yeşillik', 'Bol']]
        ],
        'Öğle Yemeği': [
            [['Kinoalı Akdeniz salatası', '1 porsiyon']],
            [['Sebzeli tavuk sote', '1 porsiyon'], ['Bulgur pilavı', '4 yemek kaşığı']]
        ],
        'Aparatif': [
            [['Mevsim meyvesi', '1 porsiyon']],
            [['Fırında baharatlı nohut', '1 kase']]
        ],
        'Akşam Yemeği': [
            [['Zeytinyağlı taze fasulye', '1 porsiyon'], ['Yoğurt', '1 kase']],
            [['Izgara balık', '150 g'], ['Roka salatası', '1 kase']]
        ]
    },
    'Vejetaryen': {
        'Kahvaltı': [
            [['Avokadolu tost', '1 adet'], ['Domates', '1 adet']],
            [['Yulaf ezmesi', '4 yemek kaşığı'], ['Badem sütü', '1 su bardağı'], ['Meyve', '1 porsiyon']]
        ],
        'Öğle Yemeği': [
            [['Mercimek köftesi', '6 adet'], ['Marul', 'Bol'], ['Ayran', '1 bardak']],
            [['Nohutlu ıspanak', '1 porsiyon'], ['Yoğurt', '1 kase']]
        ],
        'Aparatif': [
            [['Humus', '2 yemek kaşığı'], ['Havuç çubukları', '1 porsiyon']]
        ],
        'Akşam Yemeği': [
            [['Sebzeli kinoa', '1 porsiyon'], ['Cacık', '1 kase']],
            [['Zeytinyağlı barbunya', '1 porsiyon'], ['Bulgur pilavı', '3 yemek kaşığı']]
        ]
    }
};

const PLANS = [
    {category: 'Kilo Verme', title: '1500 kcal Kilo Verme Programı', description: 'Dengeli makro dağılımlı, ara öğünlü kalori açığı programı.'},
    {category: 'Kilo Alma', title: 'Sağlıklı Kilo Alma Programı', description: 'Kas kütlesini destekleyen yüksek kalorili dengeli program.'},
    {category: 'Sağlıklı Yaşam', title: 'Akdeniz Tipi Beslenme', description: 'Zeytinyağı, sebze ve balık ağırlıklı sürdürülebilir beslenme.'},
    {category: 'Vejetaryen', title: 'Vejetaryen Haftalık Program', description: 'Bitkisel protein kaynaklarıyla dengelenmiş et içermeyen program.'}
];

function buildMealPlan(menu) {
    const mealPlan = {};
    DAYS.forEach((day, dayIndex) => {
        mealPlan[day] = {};
        for (const [meal, options] of Object.entries(menu)) {
            mealPlan[day][meal] = {
                info: {image: '', time: MEAL_TIMES[meal]},
                [MAIN_MENU]: options[dayIndex % options.length].map(([name, portion]) => ({name, portion, addedBy: 'system'}))
            };
        }
    });
    return mealPlan;
}

/**
 * NutritionSeeder - Beslenme kategorileri, haftalık planlar ve danışanlara plan atamaları.
 * Her aktif danışanın bugünü kapsayan bir ataması olur; danışanın "bugünkü öğünleri" dolu görünür.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Beslenme',

    async run(ctx) {
        const t = ctx.transaction;
        const plans = [];

        for (const {category: categoryName, ...plan} of PLANS) {
            const category = await NutritionCategory.create({name: categoryName, dietitian_id: ctx.dietitian.id}, {transaction: t});
            plans.push(await NutritionPlan.create({
                ...plan,
                category_id: category.id,
                dietitian_id: ctx.dietitian.id,
                mealPlan: buildMealPlan(MENUS[categoryName])
            }, {transaction: t}));
        }

        const assignments = [];
        ctx.activeClients.forEach((client, index) => {
            const profile = ctx.clientProfiles.get(client.id);
            // Kilo alması gereken danışanlara kilo alma planı, diğerlerine sırayla kalan planlar.
            const plan = profile.currentKg > profile.startKg ? plans[1] : plans[[0, 2, 3][index % 3]];

            assignments.push({
                client_id: client.id,
                nutrition_plan_id: plan.id,
                mealPlan: plan.mealPlan,
                note: 'Öğün saatlerine dikkat edelim, günde en az 2 litre su.',
                start_date: dateOnly(-randomInt(3, 12)),
                end_date: dateOnly(randomInt(14, 28))
            });

            // Önceki dönemden bitmiş bir atama.
            if (index % 2 === 0) {
                assignments.push({
                    client_id: client.id,
                    nutrition_plan_id: plans[2].id,
                    mealPlan: plans[2].mealPlan,
                    note: 'Uyum dönemi programı.',
                    start_date: dateOnly(-45),
                    end_date: dateOnly(-15)
                });
            }
        });
        await NutritionAssignment.bulkCreate(assignments, {transaction: t});

        return `${plans.length} plan, ${assignments.length} atama`;
    }
};
