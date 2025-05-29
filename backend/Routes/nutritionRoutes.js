const path = require('path');
const express = require('express');

const router = express.Router();

const nutritionController = require(path.join(__dirname, '..', 'Controller', 'nutritionController'));

router.get('/getClientNutritionPlans', nutritionController.getClientNutritionPlans);

router.delete('/deleteClientWater', nutritionController.deleteClientWater);
router.post('/addClientWater', nutritionController.addClientWater);
router.get('/getClientWater', nutritionController.getClientWater);

module.exports = router;