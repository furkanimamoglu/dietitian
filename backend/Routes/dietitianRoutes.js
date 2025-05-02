//Library
const express = require('express');

const router = express.Router();

//Controller
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

router.get('/getAllMyNutritionCategories', dietitianController.getAllMyNutritionCategories);
router.post('/addNutritionCategories', dietitianController.addNutritionCategories);

module.exports = router;