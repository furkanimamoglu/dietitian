const path = require('path');
const express = require('express');

const router = express.Router();

const recipeController = require(path.join(__dirname, '..', 'Controller', 'recipeController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getMyRecipes', authorize(DIETITIAN), recipeController.getMyRecipes);
router.post('/addRecipe', authorize(DIETITIAN), recipeController.addRecipe);
router.put('/updateRecipe', authorize(DIETITIAN), recipeController.updateRecipe);
router.delete('/deleteRecipe', authorize(DIETITIAN), recipeController.deleteRecipe);

router.get('/getMyRecipeCategories', authorize(DIETITIAN), recipeController.getMyRecipeCategories);
router.post('/addRecipeCategory', authorize(DIETITIAN), recipeController.addRecipeCategory);
router.put('/updateRecipeCategory', authorize(DIETITIAN), recipeController.updateRecipeCategory);
router.delete('/deleteRecipeCategory', authorize(DIETITIAN), recipeController.deleteRecipeCategory);

router.post('/assignRecipeToClient', authorize(DIETITIAN), recipeController.assignRecipeToClient);
router.get('/getAssignedRecipesByClient', authorize(DIETITIAN), recipeController.getAssignedRecipesByClient);
router.delete('/deleteAssignedRecipe', authorize(DIETITIAN), recipeController.deleteAssignedRecipe);

module.exports = router;