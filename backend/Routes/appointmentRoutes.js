//Library
const express = require('express');

const router = express.Router();

//Controller
const appointmentController = require('../Controller/appointmentController');

//Routes
router.get('/fetchDietitianAppointments', appointmentController.fetchDietitianAppointments);
router.get('/fetchClientAppointmentAsDietitian', appointmentController.fetchClientAppointmentAsDietitian);
router.delete('/deleteAppointmentAsDietitian', appointmentController.deleteAppointmentAsDietitian);
router.post('/addAppointmentAsDietitian', appointmentController.addAppointmentAsDietitian);
router.put('/updateAppointmentAsDietitian', appointmentController.updateAppointmentAsDietitian)
router.put('/updateAppointmentStatus', appointmentController.updateAppointmentStatus);
router.get('/getPendingAppointments', appointmentController.getPendingAppointments);
router.get('/getTodayApprovedAppointments', appointmentController.getTodayApprovedAppointments);

router.get('/getTodayAppointmentCount', appointmentController.getTodayAppointmentCount);
router.get('/getRemainingTodayAppointmentCount', appointmentController.getRemainingTodayAppointmentCount);
router.get('/getPendingAppointmentCount', appointmentController.getPendingAppointmentCount);

router.get('/fetchClientAppointments', appointmentController.fetchClientAppointments);
router.post('/addAppointmentAsClient', appointmentController.addAppointmentAsClient);

module.exports = router;