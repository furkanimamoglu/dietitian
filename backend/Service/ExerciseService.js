const path = require('path');
const { Op } = require('sequelize');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {Exercise, ExerciseCategory, ExerciseAssignment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

class ExerciseService {

    static async getMyExercises(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Exercise.findAll({
            where: {dietitian_id}
        });
    }

    static async getClientExercises(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!client_id) {
            throw new Exception("Danışan ID eksik.", 400, true);
        }

        return await ExerciseAssignment.findAll({
            where: {client_id},
            include: [
                {
                    model: Exercise,
                    as: 'Exercise',
                    where: {dietitian_id}
                }
            ]
        });
    }

    static async addExercise(dietitian_id, exerciseData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!exerciseData || !exerciseData.exercise_name) {
            throw new Exception("Eksik egzersiz verisi.", 400, true);
        }

        return await Exercise.create({
            ...exerciseData,
            dietitian_id: dietitian_id
        });
    }

    static async getAssignedExercisesByClient(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!client_id) {
            throw new Exception("Danışan ID eksik.", 400, true);
        }

        return await ExerciseAssignment.findAll({
            where: {client_id},
            include: [
                {
                    model: Exercise,
                    as: 'Exercise',
                    where: {dietitian_id}
                }
            ]
        });
    }

    static async getClientExerciseHistory(dietitian_id, client_id, startDate, endDate) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!client_id) {
            throw new Exception("Danışan ID eksik.", 400, true);
        }

        const whereClause = { client_id };
        
        if (startDate && endDate) {
            whereClause.updatedAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        return await ExerciseAssignment.findAll({
            where: whereClause,
            include: [
                {
                    model: Exercise,
                    as: 'Exercise',
                    where: {dietitian_id},
                    required: true
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
    }

    static async deleteExerciseAssignment(dietitian_id, exercise_assignment_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const assignment = await ExerciseAssignment.findOne({
            where: {
                id: exercise_assignment_id,
                '$Exercise.dietitian_id$': dietitian_id
            },
            include: [
                {
                    model: Exercise,
                    as: 'Exercise'
                }
            ]
        });

        if (!assignment) {
            throw new Exception("Egzersiz ataması bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await assignment.destroy();

        return {success: true, message: "Egzersiz ataması başarıyla silindi."};
    }

    static async assignExercise(dietitian_id, exercise_id, client_id, start_date, end_date, note) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!exercise_id || !client_id) {
            throw new Exception("Egzersiz ID veya Danışan ID eksik.", 400, true);
        }

        if (!start_date || !end_date) {
            throw new Exception("Başlangıç ve bitiş tarihleri gereklidir.", 400, true);
        }

        const exercise = await Exercise.findOne({
            where: {
                id: exercise_id,
                dietitian_id: dietitian_id
            }
        });

        if (!exercise) {
            throw new Exception("Egzersiz bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await ExerciseAssignment.create({
            client_id: client_id,
            exercise_id: exercise_id,
            note: note,
            start_date: start_date,
            end_date: end_date
        });
    }

    static async updateExercise(dietitian_id, exercise_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const exercise = await Exercise.findOne({
            where: {
                id: exercise_id,
                dietitian_id: dietitian_id
            }
        });

        if (!exercise) {
            throw new Exception("Egzersiz bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await exercise.update(updateData);
    }


    static async deleteExercise(dietitian_id, exercise_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const exercise = await Exercise.findOne({
            where: {
                id: exercise_id,
                dietitian_id: dietitian_id
            }
        });

        if (!exercise) {
            throw new Exception("Egzersiz bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await exercise.destroy();

        return {success: true, message: "Egzersiz başarıyla silindi."};
    }

    static async getMyExerciseCategories(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await ExerciseCategory.findAll({
            where: {dietitian_id}
        });
    }

    static async addExerciseCategory(dietitian_id, exercise_category_name) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!exercise_category_name) {
            throw new Exception("Kategori adı gereklidir.", 400, true);
        }

        return await ExerciseCategory.create({
            dietitian_id: dietitian_id,
            name: exercise_category_name
        });
    }

    static async updateExerciseCategory(dietitian_id, exercise_category_id, exercise_category_name) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const category = await ExerciseCategory.findOne({
            where: {
                id: exercise_category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw new Exception("Egzersiz Kategorisi bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await category.update({name: exercise_category_name});

        return category;
    }

    static async deleteExerciseCategory(dietitian_id, exercise_category_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const category = await ExerciseCategory.findOne({
            where: {
                id: exercise_category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw new Exception("Egzersiz Kategorisi bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await category.destroy();

        return {success: true, message: "Egzersiz Kategorisi başarıyla silindi."};
    }

}

module.exports = ExerciseService;
