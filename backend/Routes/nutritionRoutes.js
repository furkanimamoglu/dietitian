const path = require('path');
const express = require('express');

const router = express.Router();

const nutritionController = require(path.join(__dirname, '..', 'Controller', 'nutritionController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {CLIENT, DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.post('/addNutritionCategory', authorize(DIETITIAN), nutritionController.addNutritionCategory);
router.get('/getNutritionCategories', authorize(DIETITIAN), nutritionController.getNutritionCategories);
router.delete('/deleteNutritionCategory', authorize(DIETITIAN), nutritionController.deleteNutritionCategory);

router.post('/assignNutritionPlanToClient', authorize(DIETITIAN), nutritionController.assignNutritionPlanToClient);
router.post('/assignCustomPlanToClient', authorize(DIETITIAN), nutritionController.assignCustomPlanToClient);

router.get('/getNutritionPlans', authorize(DIETITIAN), nutritionController.getNutritionPlans);
router.delete('/deleteNutritionPlan', authorize(DIETITIAN), nutritionController.deleteNutritionPlan);
router.post('/addNutritionPlan', authorize(DIETITIAN), nutritionController.addNutritionPlan);
router.put('/updateNutritionPlan', authorize(DIETITIAN), nutritionController.updateNutritionPlan);
router.post('/getNutritionAssignmentPlanByClient', authorize(DIETITIAN), nutritionController.getNutritionAssignmentPlanByClient);
router.delete('/deleteNutritionAssignment', authorize(DIETITIAN), nutritionController.deleteNutritionAssignment);

router.get('/getClientNutritionPlans', authorize(DIETITIAN), nutritionController.getClientNutritionPlans);

router.delete('/deleteClientWater', authorize(CLIENT), nutritionController.deleteClientWater);
router.post('/addClientWater', authorize(CLIENT), nutritionController.addClientWater);
router.get('/getClientWater', authorize(CLIENT, DIETITIAN), nutritionController.getClientWater);

router.put('/updateClientWaterGoal', authorize(DIETITIAN), nutritionController.updateClientWaterGoal);

module.exports = router;