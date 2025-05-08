//Library
const express = require('express');

const router = express.Router();

//Controller
const appointmentController = require('../Controller/appointmentController');

//Routes
router.get('/fetchDietitianAppointments', appointmentController.fetchDietitianAppointments);
router.post('/addAppointmentAsDietitian', appointmentController.addAppointmentAsDietitian);
router.put('/updateAppointmentAsDietitian', appointmentController.updateAppointmentAsDietitian)

router.get('/fetchClientAppointments', appointmentController.fetchClientAppointments);
router.post('/addAppointmentAsClient', appointmentController.addAppointmentAsClient);

module.exports = router;