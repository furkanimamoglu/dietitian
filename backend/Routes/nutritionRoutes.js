const path = require('path');
const express = require('express');

const router = express.Router();

const nutritionController = require(path.join(__dirname, '..', 'Controller', 'nutritionController'));

router.post('/addNutritionCategory', nutritionController.addNutritionCategory);
router.get('/getNutritionCategories', nutritionController.getNutritionCategories);
router.delete('/deleteNutritionCategory', nutritionController.deleteNutritionCategory);
router.post('/assignNutritionPlanToClient', nutritionController.assignNutritionPlanToClient);
router.get('/getNutritionPlans', nutritionController.getNutritionPlans);
router.delete('/deleteNutritionPlan', nutritionController.deleteNutritionPlan);
router.post('/addNutritionPlan', nutritionController.addNutritionPlan);
router.put('/updateNutritionPlan', nutritionController.updateNutritionPlan);
router.post('/getNutritionAssignmentPlanByClient', nutritionController.getNutritionAssignmentPlanByClient);

router.get('/getClientNutritionPlans', nutritionController.getClientNutritionPlans);

router.delete('/deleteClientWater', nutritionController.deleteClientWater);
router.post('/addClientWater', nutritionController.addClientWater);
router.get('/getClientWater', nutritionController.getClientWater);

router.put('/updateClientWaterGoal', nutritionController.updateClientWaterGoal);

module.exports = router;