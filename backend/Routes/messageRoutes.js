const express = require('express');

const router = express.Router();

const messageController = require('../Controller/messageController');

// Dietitian
router.get('/getMyMessages', messageController.getMyMessages);

module.exports = router;