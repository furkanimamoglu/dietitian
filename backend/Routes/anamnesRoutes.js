const path = require('path');
const express = require('express');

const router = express.Router();

const anamnesController = require(path.join(__dirname, '..', 'Controller', 'anamnesController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getAnamnes', authorize(DIETITIAN), anamnesController.getAnamnes);
router.put('/updateAnamnes', authorize(DIETITIAN), anamnesController.updateAnamnes);

module.exports = router;