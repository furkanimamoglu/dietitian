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

router.put('/approveKVKK', clientController.approveKVKK);

router.put('/updateApprovalSettings', clientController.updateApprovalSettings);

router.get('/getTodayMealPlan', clientController.getTodayMealPlan);
router.get('/getMyRecipes', clientController.getMyRecipes);
router.get('/getMyLatestMeasurement', clientController.getMyLatestMeasurement);

router.post('/updateMealPlan', clientController.updateMealPlan);

router.get('/getMyDailyExercises', clientController.getMyDailyExercises);
router.put('/updateMyExercise', clientController.updateMyExercise);

router.put('/updateFCMToken', clientController.updateFCMToken);

module.exports = router;