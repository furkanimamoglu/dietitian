const express = require('express');

const router = express.Router();

const invoiceController = require('../Controller/invoiceController');

router.get('/fetchAllInvoicesAsDietitian', invoiceController.fetchAllInvoicesAsDietitian);

module.exports = router;