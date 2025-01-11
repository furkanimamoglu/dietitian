//Library
const express = require('express');

const router = express.Router();

//Controller
const appointmentController = require('../Controller/appointmentController');

//Routes
router.get('/fetchDietitianAppointments', appointmentController.fetchDietitianAppointments);

module.exports = router;