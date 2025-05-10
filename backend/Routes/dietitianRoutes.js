const express = require('express');
const router = express.Router();

const dietitianController = require('../Controller/dietitianController');

router.post('/login', dietitianController.login);
router.post('/register', dietitianController.register);

router.get('/getDietitianInfo', dietitianController.getDietitianInfo)

router.post('/registerClient', dietitianController.registerClient);
router.delete('/deleteClient', dietitianController.deleteClient);
router.put('/updateClient', dietitianController.updateClient)
router.get('/getMyClient', dietitianController.getMyClient);
router.get('/getAllMyClients', dietitianController.getAllMyClients);
router.get('/getMyActiveClientCount', dietitianController.getMyActiveClientCount)

router.get('/globalSearchbar', dietitianController.globalSearchbar);

router.get('/getDietitianQR', dietitianController.createMyQR);
router.get('/getDietitianNameById', dietitianController.getDietitianNameById);

router.get('/getNutritionCategories', dietitianController.getNutritionCategories);
router.delete('/deleteNutritionCategory', dietitianController.deleteNutritionCategory);
router.post('/addNutritionCategory', dietitianController.addNutritionCategory);
router.put('/updateNutritionPlan', dietitianController.updateNutritionPlan);
router.post('/getNutritionPlanByClient', dietitianController.getNutritionPlanByClient);

router.post('/assignNutritionPlanToClient', dietitianController.assignNutritionPlanToClient);
router.post('/addNutritionPlan', dietitianController.addNutritionPlan);
router.get('/getNutritionPlans', dietitianController.getNutritionPlans);
router.delete('/deleteNutritionPlan', dietitianController.deleteNutritionPlan);

module.exports = router;