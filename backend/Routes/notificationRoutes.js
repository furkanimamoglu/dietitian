const path = require('path');
const express = require('express');

const router = express.Router();

const notificationController = require(path.join(__dirname, '..', 'Controller', 'notificationController'));

router.post('/sendNotificationToClient', notificationController.sendNotificationToClient);

module.exports = router;