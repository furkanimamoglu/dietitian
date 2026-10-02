const path = require('path');
const express = require('express');

const router = express.Router();

const notificationController = require(path.join(__dirname, '..', 'Controller', 'notificationController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.post('/sendNotificationToClient', authorize(DIETITIAN), notificationController.sendNotificationToClient);
router.post('/sendNotificationToAllMyClients', authorize(DIETITIAN), notificationController.sendNotificationToAllMyClients);

router.post('/sendAppointmentReminder', authorize(DIETITIAN), notificationController.sendAppointmentReminder);
router.post('/sendAppointmentChangeNotification', authorize(DIETITIAN), notificationController.sendAppointmentChangeNotification);
router.post('/sendAppointmentCancellationNotification', authorize(DIETITIAN), notificationController.sendAppointmentCancellationNotification);

router.post('/sendAppointmentNotification', authorize(DIETITIAN), notificationController.sendAppointmentNotification);

router.post('/sendNutritionPlanAssignedNotification', authorize(DIETITIAN), notificationController.sendNutritionPlanAssignedNotification);
router.post('/sendExerciseAssignedNotification', authorize(DIETITIAN), notificationController.sendExerciseAssignedNotification);

router.post('/sendPaymentReminderNotification', authorize(DIETITIAN), notificationController.sendPaymentReminderNotification);

router.post('/sendRecipeAssignedNotification', authorize(DIETITIAN), notificationController.sendRecipeAssignedNotification);

module.exports = router;