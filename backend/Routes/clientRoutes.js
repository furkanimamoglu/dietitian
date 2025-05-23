const path = require('path');
const express = require('express');

const router = express.Router();

const clientController = require(path.join(__dirname, '..', 'Controller', 'clientController'));

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

router.get('/getMyDailyExercises', clientController.getMyDailyExercises);
router.put('/updateMyExercise', clientController.updateMyExercise);

module.exports = router;