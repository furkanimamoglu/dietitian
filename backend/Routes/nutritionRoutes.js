const path = require('path');
const express = require('express');

const router = express.Router();

const nutritionController = require(path.join(__dirname, '..', 'Controller', 'nutritionController'));

router.get('/getClientNutritionPlans', nutritionController.getClientNutritionPlans);

module.exports = router;