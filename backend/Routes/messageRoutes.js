const express = require('express');

const router = express.Router();

const messageController = require('../Controller/messageController');

// Dietitian
router.get('/getMyMessagesAsDietitian', messageController.getMyMessagesAsDietitian);

// Client
router.get('/getMyMessagesAsClient', messageController.getMyMessagesAsClient);

module.exports = router;