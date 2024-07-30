//Library
const express = require('express');

const router = express.Router();

//Controller
const systemController = require('../Controller/systemController');

//Routes
router.get('/settings' , systemController.settings);
router.post('/backup' , systemController.backup);

module.exports = router;