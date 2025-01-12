//Library
const express = require('express');

const router = express.Router();

//Controller
const dietitianController = require('../Controller/dietitianController');

//Routes
router.post('/login', dietitianController.login);
router.post('/register', dietitianController.register);
router.post('/registerClient', dietitianController.registerClient);
router.post('/deleteClient', dietitianController.deleteClient);
router.get('/getAllMyClients', dietitianController.getAllMyClients);

module.exports = router;