const express = require('express');

const router = express.Router();

const invoiceController = require('../Controller/invoiceController');

router.get('/getMyInvoices', invoiceController.getMyInvoices);
router.get('/getClientInvoices', invoiceController.getClientInvoices);
router.delete('/deleteInvoice', invoiceController.deleteInvoice);
router.put('/updateInvoice', invoiceController.updateInvoice);
router.post('/addInvoice', invoiceController.addInvoice);

module.exports = router;