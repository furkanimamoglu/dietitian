//Library
const express = require('express');

const router = express.Router();

//Controller
const clientController = require('../Controller/clientController');

//Routes
router.post('/login', clientController.login);
router.post('/register', clientController.register);

router.get('/getClientInfo', clientController.getClientInfo);

router.get('/getMyNotifications', clientController.getMyNotifications);
router.get('/readMyAllNotifications', clientController.readMyAllNotifications);

router.get('/getMyKVKKStatus', clientController.getMyKVKKStatus);
router.put('/approveKVKK', clientController.approveKVKK);

router.get('/getTodayMeal', clientController.getTodayMeal);
router.get('/getMyLatestMeasurement', clientController.getMyLatestMeasurement);

router.post('/updateMealPlan', clientController.updateMealPlan);

module.exports = router;