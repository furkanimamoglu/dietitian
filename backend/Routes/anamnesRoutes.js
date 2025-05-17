const express = require('express');

const router = express.Router();

const anamnesController = require('../Controller/anamnesController');

router.get('/getClientAnamnes', anamnesController.getClientAnamnes);

module.exports = router;