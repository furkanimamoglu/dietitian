const express = require('express');

const router = express.Router();

const messageController = require('../Controller/messageController');

router.get('/getMyMessages', messageController.getMyMessages);
router.post('/sendMessage', messageController.sendMessage);

module.exports = router;