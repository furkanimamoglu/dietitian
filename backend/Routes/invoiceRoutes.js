const express = require('express');

const router = express.Router();

const invoiceController = require('../Controller/invoiceController');

router.get('/getMyInvoices', invoiceController.getMyInvoices);

module.exports = router;