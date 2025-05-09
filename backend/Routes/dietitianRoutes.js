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

router.get('/globalSearchbar', dietitianController.globalSearchbar);

router.get('/getDietitianQR', dietitianController.createMyQR);
router.get('/getDietitianNameById', dietitianController.getDietitianNameById);

router.get('/getNutritionCategories', dietitianController.getNutritionCategories);
router.delete('/deleteNutritionCategory', dietitianController.deleteNutritionCategory);
router.post('/addNutritionCategory', dietitianController.addNutritionCategory);
router.post('/assignNutritionPlanToClient', dietitianController.assignNutritionPlanToClient);

module.exports = router;