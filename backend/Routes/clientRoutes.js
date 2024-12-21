//Library
const express = require('express');

const router = express.Router();

//Controller
const clientController = require('../Controller/dietitianController');

//Routes
router.post('/login' , clientController.login);

module.exports = router;