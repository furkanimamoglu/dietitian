const Exception = require("../Exception/Exception");
const {Exercise, ExerciseCategory} = require("../Model/MainModel");

class ExerciseService {

    static async getMyExercises(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Exercise.findAll({
            where: { dietitian_id }
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

        return { success: true, message: "Egzersiz başarıyla silindi." };
    }

    static async getMyExerciseCategories(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await ExerciseCategory.findAll({
            where: { dietitian_id }
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

        await category.update({ name: exercise_category_name });

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

        return { success: true, message: "Egzersiz Kategorisi başarıyla silindi." };
    }

}

module.exports = ExerciseService;
