const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {Recipe, RecipeCategory, RecipeAssignment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

class RecipeService {

    static async getMyRecipes(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Recipe.findAll({
            where: {dietitian_id}
        });
    }

    static async addRecipe(dietitian_id, recipeData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!recipeData || !recipeData.name || !recipeData.hazirlanis || !recipeData.malzemeler) {
            throw new Exception("Eksik tarif verisi.", 400, true);
        }

        return await Recipe.create({
            ...recipeData,
            dietitian_id: dietitian_id
        });
    }

    static async updateRecipe(dietitian_id, recipe_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await Recipe.findOne({
            where: {
                id: recipe_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Tarif bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await recipe.update(updateData);
    }


    static async deleteRecipe(dietitian_id, recipe_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await Recipe.findOne({
            where: {
                id: recipe_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Tarif bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await recipe.destroy();

        return {success: true, message: "Tarif başarıyla silindi."};
    }

    static async getMyRecipeCategories(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await RecipeCategory.findAll({
            where: {dietitian_id}
        });
    }

    static async addRecipeCategory(dietitian_id, recipe_category_name) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!recipe_category_name) {
            throw new Exception("Kategori adı gereklidir.", 400, true);
        }

        return await RecipeCategory.create({
            dietitian_id: dietitian_id,
            name: recipe_category_name
        });
    }

    static async updateRecipeCategory(dietitian_id, recipe_category_id, recipe_category_name) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await RecipeCategory.findOne({
            where: {
                id: recipe_category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Tarif Kategorisi bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await recipe.update({name: recipe_category_name});

        return recipe;
    }

    static async deleteRecipeCategory(dietitian_id, recipe_category_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await RecipeCategory.findOne({
            where: {
                id: recipe_category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Tarif Kategorisi bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await recipe.destroy();

        return {success: true, message: "Tarif Kategorisi başarıyla silindi."};
    }

    static async assignRecipeToClient(dietitian_id, client_id, recipe_id, note) {
        if (!dietitian_id || !client_id || !recipe_id) {
            throw new Exception("Eksik veri.", 400, true);
        }

        const existingAssignment = await RecipeAssignment.findOne({
            where: {
                dietitian_id: dietitian_id,
                client_id: client_id,
                recipe_id: recipe_id
            }
        });

        if (existingAssignment) {
            throw new Exception("Bu tarif zaten bu danışana daha önce atanmış.", 409, true);
        }

        return await RecipeAssignment.create({
            dietitian_id: dietitian_id,
            client_id: client_id,
            recipe_id: recipe_id,
            note: note
        });
    }

    static async getAssignedRecipesByClient(dietitian_id, client_id) {
        if (!dietitian_id || !client_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await RecipeAssignment.findAll({
            where: {
                dietitian_id: dietitian_id,
                client_id: client_id
            },
            include: [
                {
                    model: Recipe,
                    as: 'Recipe'
            }
            ]
        });
    }

}

module.exports = RecipeService;
