const express = require('express');

const router = express.Router();

const measurementController = require('../Controller/measurementController');

router.get('/getClientMeasurement', measurementController.getClientMeasurement);

module.exports = router;