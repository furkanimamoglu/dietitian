//Library
const express = require('express');

const router = express.Router();

//Controller
const utilController = require('../Controller/utilController');

//Routes
router.get('/getUserRole', utilController.getUserRole);

module.exports = router;