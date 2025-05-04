//Library
const express = require('express');

const router = express.Router();

//Controller
const systemController = require('../Controller/systemController');

//Routes
router.get('/settings', systemController.settings);

module.exports = router;