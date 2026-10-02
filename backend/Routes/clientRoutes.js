const path = require('path');
const express = require('express');

const router = express.Router();

const clientController = require(path.join(__dirname, '..', 'Controller', 'clientController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));

//Routes
router.post('/login', clientController.login);
router.post('/register', clientController.register);

router.get('/getClientInfo', authorize(CLIENT), clientController.getClientInfo);

router.get('/getMyNotifications', authorize(CLIENT), clientController.getMyNotifications);
router.get('/readMyAllNotifications', authorize(CLIENT), clientController.readMyAllNotifications);

router.put('/approveKVKK', authorize(CLIENT), clientController.approveKVKK);

router.put('/updateApprovalSettings', authorize(CLIENT), clientController.updateApprovalSettings);

router.get('/getTodayMealPlan', authorize(CLIENT), clientController.getTodayMealPlan);
router.get('/getMyRecipes', authorize(CLIENT), clientController.getMyRecipes);
router.get('/getMyLatestMeasurement', authorize(CLIENT), clientController.getMyLatestMeasurement);

router.post('/updateMealPlan', authorize(CLIENT), clientController.updateMealPlan);

router.get('/getMyDailyExercises', authorize(CLIENT), clientController.getMyDailyExercises);
router.put('/updateMyExercise', authorize(CLIENT), clientController.updateMyExercise);

router.put('/updateFCMToken', authorize(CLIENT), clientController.updateFCMToken);

router.put('/updateProfilePhoto', authorize(CLIENT), clientController.updateProfilePhoto);

module.exports = router;