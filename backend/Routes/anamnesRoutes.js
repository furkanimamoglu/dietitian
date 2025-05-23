const path = require('path');
const express = require('express');

const router = express.Router();

const anamnesController = require(path.join(__dirname, '..', 'Controller', 'anamnesController'));

router.get('/getAnamnes', anamnesController.getAnamnes);
router.put('/updateAnamnes', anamnesController.updateAnamnes);

module.exports = router;