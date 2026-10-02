const path = require('path');
const express = require('express');

const router = express.Router();

const appointmentController = require(path.join(__dirname, '..', 'Controller', 'appointmentController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {CLIENT, DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/fetchDietitianAppointments', authorize(DIETITIAN), appointmentController.fetchDietitianAppointments);
router.get('/fetchClientAppointmentAsDietitian', authorize(DIETITIAN), appointmentController.fetchClientAppointmentAsDietitian);
router.delete('/deleteAppointmentAsDietitian', authorize(DIETITIAN), appointmentController.deleteAppointmentAsDietitian);
router.delete('/deleteAppointmentAsClient', authorize(CLIENT), appointmentController.deleteAppointmentAsClient);
router.post('/addAppointmentAsDietitian', authorize(DIETITIAN), appointmentController.addAppointmentAsDietitian);
router.put('/updateAppointmentAsDietitian', authorize(DIETITIAN), appointmentController.updateAppointmentAsDietitian);
router.put('/updateAppointmentStatus', authorize(DIETITIAN), appointmentController.updateAppointmentStatus);
router.get('/getPendingAppointments', authorize(DIETITIAN), appointmentController.getPendingAppointments);
router.get('/getTodayApprovedAppointments', authorize(DIETITIAN), appointmentController.getTodayApprovedAppointments);

router.get('/getTodayAppointmentCount', authorize(DIETITIAN), appointmentController.getTodayAppointmentCount);
router.get('/getRemainingTodayAppointmentCount', authorize(DIETITIAN), appointmentController.getRemainingTodayAppointmentCount);
router.get('/getPendingAppointmentCount', authorize(DIETITIAN), appointmentController.getPendingAppointmentCount);

router.get('/fetchClientAppointments', authorize(CLIENT), appointmentController.fetchClientAppointments);
router.post('/addAppointmentAsClient', authorize(CLIENT), appointmentController.addAppointmentAsClient);

module.exports = router;