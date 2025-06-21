const path = require('path');
const express = require('express');

const router = express.Router();

const notificationController = require(path.join(__dirname, '..', 'Controller', 'notificationController'));

router.post('/sendNotificationToClient', notificationController.sendNotificationToClient);
router.post('/sendNotificationToAllMyClients', notificationController.sendNotificationToAllMyClients);

router.post('/sendAppointmentReminder', notificationController.sendAppointmentReminder);

router.post('/sendNutritionPlanAssignedNotification', notificationController.sendNutritionPlanAssignedNotification);
router.post('/sendExerciseAssignedNotification', notificationController.sendExerciseAssignedNotification);

router.post('/sendPaymentReminderNotification', notificationController.sendPaymentReminderNotification);

router.post('/sendRecipeAssignedNotification', notificationController.sendRecipeAssignedNotification);

module.exports = router;