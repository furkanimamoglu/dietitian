const path = require("path");

const RecipeService = require(path.join(__dirname, "..", "Service", "RecipeService"));

class recipeController {

    static async getMyRecipes(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await RecipeService.getMyRecipes(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addRecipe(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {
                name,
                description,
                category_id,
                hazirlanis,
                image,
                malzemeler,
                kcal,
                protein,
                karbonhidrat,
                yag
            } = req.body;

            const result = await RecipeService.addRecipe(dietitian_id, {
                name,
                description,
                category_id,
                image,
                hazirlanis,
                malzemeler,
                kcal,
                protein,
                karbonhidrat,
                yag
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateRecipe(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {
                recipe_id,
                name,
                description,
                category_id,
                image,
                hazirlanis,
                malzemeler,
                kcal,
                protein,
                karbonhidrat,
                yag
            } = req.body;

            const result = await RecipeService.updateRecipe(dietitian_id, recipe_id, {
                name,
                description,
                category_id,
                image,
                hazirlanis,
                malzemeler,
                kcal,
                protein,
                karbonhidrat,
                yag
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteRecipe(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {recipe_id} = req.query;

            const result = await RecipeService.deleteRecipe(dietitian_id, recipe_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getMyRecipeCategories(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await RecipeService.getMyRecipeCategories(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addRecipeCategory(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {recipe_category_name} = req.body;

            const result = await RecipeService.addRecipeCategory(dietitian_id, recipe_category_name);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateRecipeCategory(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {recipe_category_id, recipe_category_name} = req.body;

            const result = await RecipeService.updateRecipeCategory(dietitian_id, recipe_category_id, recipe_category_name);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteRecipeCategory(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {recipe_category_id} = req.query;

            const result = await RecipeService.deleteRecipeCategory(dietitian_id, recipe_category_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async assignRecipeToClient(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {recipe_id, client_id} = req.query;
            const {note} = req.body;

            const result = await RecipeService.assignRecipeToClient(dietitian_id, recipe_id, client_id, note);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getAssignedRecipesByClient(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const result = await RecipeService.getAssignedRecipesByClient(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteAssignedRecipe(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {assigned_recipe_id} = req.query;

            const result = await RecipeService.deleteAssignedRecipe(dietitian_id, assigned_recipe_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = recipeController;