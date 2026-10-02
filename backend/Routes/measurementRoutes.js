const path = require('path');
const express = require('express');

const router = express.Router();

const measurementController = require(path.join(__dirname, '..', 'Controller', 'measurementController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getClientMeasurement', authorize(DIETITIAN), measurementController.getClientMeasurement);
router.post('/createMeasurement', authorize(DIETITIAN), measurementController.createMeasurement);
router.put('/updateMeasurement', authorize(DIETITIAN), measurementController.updateMeasurement);
router.delete('/deleteMeasurement', authorize(DIETITIAN), measurementController.deleteMeasurement);

module.exports = router;