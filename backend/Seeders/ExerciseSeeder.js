const path = require('path');

const {Exercise, ExerciseCategory, ExerciseAssignment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {pickMany, randomInt, dateOnly} = require(path.join(__dirname, 'SeedUtils'));

// duration: dakika, difficulty: 1-5
const EXERCISES = {
    'Kardiyo': [
        {exercise_name: 'Tempolu Yürüyüş', duration: 40, difficulty: 1, equipment: 'Yok', calories_burned: 200, exercise_description: 'Orta tempoda, konuşabilecek hızda yürüyüş.'},
        {exercise_name: 'Hafif Koşu', duration: 25, difficulty: 3, equipment: 'Koşu ayakkabısı', calories_burned: 280, exercise_description: 'Isınma sonrası sabit tempoda koşu.'},
        {exercise_name: 'Bisiklet', duration: 30, difficulty: 2, equipment: 'Sabit bisiklet', calories_burned: 250, exercise_description: 'Orta dirençte sabit bisiklet çalışması.'},
        {exercise_name: 'İp Atlama', duration: 15, difficulty: 3, equipment: 'Atlama ipi', calories_burned: 180, exercise_description: '1 dakika atlama, 30 saniye dinlenme şeklinde aralıklı çalışma.'}
    ],
    'Kuvvet': [
        {exercise_name: 'Squat', duration: 15, difficulty: 2, equipment: 'Yok', calories_burned: 90, exercise_description: '3 set x 15 tekrar, sırt düz ve dizler ayak ucu hizasında.'},
        {exercise_name: 'Şınav', duration: 10, difficulty: 3, equipment: 'Mat', calories_burned: 70, exercise_description: '3 set x 10 tekrar, gerekirse dizler yerde.'},
        {exercise_name: 'Plank', duration: 10, difficulty: 2, equipment: 'Mat', calories_burned: 50, exercise_description: '4 set x 30 saniye, karın sıkı ve kalça düz.'},
        {exercise_name: 'Dambıl ile Omuz Press', duration: 15, difficulty: 3, equipment: 'Dambıl', calories_burned: 80, exercise_description: '3 set x 12 tekrar, hafif ağırlıkla.'}
    ],
    'Esneklik': [
        {exercise_name: 'Tüm Vücut Esneme', duration: 15, difficulty: 1, equipment: 'Mat', calories_burned: 40, exercise_description: 'Her harekette 30 saniye bekleyerek tüm kas gruplarını esnetin.'},
        {exercise_name: 'Bel ve Sırt Mobilizasyonu', duration: 10, difficulty: 1, equipment: 'Mat', calories_burned: 30, exercise_description: 'Kedi-deve ve çocuk pozu ile bel bölgesini rahatlatma.'}
    ],
    'Yoga & Pilates': [
        {exercise_name: 'Başlangıç Yogası', duration: 30, difficulty: 2, equipment: 'Mat', calories_burned: 120, exercise_description: 'Güneşe selam serisi ve temel duruşlar.'},
        {exercise_name: 'Mat Pilates', duration: 30, difficulty: 3, equipment: 'Mat', calories_burned: 150, exercise_description: 'Karın ve core bölgesine odaklı pilates akışı.'}
    ]
};

/**
 * ExerciseSeeder - Egzersiz kategorileri, egzersizler ve aktif danışanlara egzersiz atamaları.
 * Atamaların bir kısmı bugünü kapsar; danışanın "bugünkü egzersizleri" dolu görünür.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Egzersiz',

    async run(ctx) {
        const t = ctx.transaction;
        ctx.exercises = [];

        for (const [categoryName, exercises] of Object.entries(EXERCISES)) {
            const category = await ExerciseCategory.create({name: categoryName, dietitian_id: ctx.dietitian.id}, {transaction: t});
            const created = await Exercise.bulkCreate(exercises.map(exercise => ({
                ...exercise,
                dietitian_id: ctx.dietitian.id,
                category_id: category.id
            })), {transaction: t, returning: true});
            ctx.exercises.push(...created);
        }

        const assignments = [];
        for (const client of ctx.activeClients) {
            // Bugünü kapsayan aktif atamalar; biri bugün tamamlanmış.
            pickMany(ctx.exercises, randomInt(2, 3)).forEach((exercise, index) => {
                assignments.push({
                    client_id: client.id,
                    exercise_id: exercise.id,
                    status: index === 0 ? 'completed' : 'active',
                    duration: index === 0 ? exercise.duration : null,
                    note: index === 0 ? 'Harika gidiyorsun!' : null,
                    start_date: dateOnly(-randomInt(3, 10)),
                    end_date: dateOnly(randomInt(5, 20))
                });
            });

            // Geçmişte tamamlanmış bir program.
            const past = ctx.exercises[randomInt(0, ctx.exercises.length - 1)];
            assignments.push({
                client_id: client.id,
                exercise_id: past.id,
                status: 'completed',
                duration: past.duration,
                note: null,
                start_date: dateOnly(-40),
                end_date: dateOnly(-20)
            });
        }
        await ExerciseAssignment.bulkCreate(assignments, {transaction: t});

        return `${ctx.exercises.length} egzersiz, ${assignments.length} atama`;
    }
};
