const path = require('path');
const express = require('express');

const router = express.Router();

const messageController = require(path.join(__dirname, '..', 'Controller', 'messageController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));

router.get('/getMyMessages', authorize(), messageController.getMyMessages);
router.get('/getMyUnreadMessageCount', authorize(), messageController.getMyUnreadMessageCount);
router.post('/changeMessageStatusToReaded', authorize(), messageController.changeMessageStatusToReaded);
router.post('/sendMessage', authorize(), messageController.sendMessage);

module.exports = router;