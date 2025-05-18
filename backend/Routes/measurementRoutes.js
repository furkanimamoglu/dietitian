const express = require('express');

const router = express.Router();

const measurementController = require('../Controller/measurementController');

router.get('/getClientMeasurement', measurementController.getClientMeasurement);
router.post('/createMeasurement', measurementController.createMeasurement);
router.put('/updateMeasurement', measurementController.updateMeasurement);
router.delete('/deleteMeasurement', measurementController.deleteMeasurement);

module.exports = router;