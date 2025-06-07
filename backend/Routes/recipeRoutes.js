const path = require('path');
const express = require('express');

const router = express.Router();

const recipeController = require(path.join(__dirname, '..', 'Controller', 'recipeController'));

router.get('/getMyRecipes', recipeController.getMyRecipes);
router.post('/addRecipe', recipeController.addRecipe);
router.put('/updateRecipe', recipeController.updateRecipe);
router.delete('/deleteRecipe', recipeController.deleteRecipe);

router.get('/getMyRecipeCategories', recipeController.getMyRecipeCategories);
router.post('/addRecipeCategory', recipeController.addRecipeCategory);
router.put('/updateRecipeCategory', recipeController.updateRecipeCategory);
router.delete('/deleteRecipeCategory', recipeController.deleteRecipeCategory);

router.post('/assignRecipeToClient', recipeController.assignRecipeToClient);
router.get('/getAssignedRecipesByClient', recipeController.getAssignedRecipesByClient);

module.exports = router;