//Library
const express = require('express');

const router = express.Router();

//Controller
const clientController = require('../Controller/clientController');

//Routes
router.post('/login', clientController.login);
router.post('/register', clientController.register);

router.get('/getClientInfo', clientController.getClientInfo);

router.get('/getMyNotifications', clientController.getMyNotifications);
router.get('/readMyAllNotifications', clientController.readMyAllNotifications);

module.exports = router;