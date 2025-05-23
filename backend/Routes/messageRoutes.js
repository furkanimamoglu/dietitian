const path = require('path');
const express = require('express');

const router = express.Router();

const messageController = require(path.join(__dirname, '..', 'Controller', 'messageController'));

router.get('/getMyMessages', messageController.getMyMessages);
router.post('/sendMessage', messageController.sendMessage);

module.exports = router;