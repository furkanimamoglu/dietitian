const path = require('path');
const express = require('express');

const router = express.Router();

const invoiceController = require(path.join(__dirname, '..', 'Controller', 'invoiceController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {CLIENT, DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getMyInvoices', authorize(), invoiceController.getMyInvoices);
router.get('/getClientInvoices', authorize(), invoiceController.getClientInvoices);
router.get('/getClientInvoicesAsClient', authorize(CLIENT), invoiceController.getClientInvoicesAsClient);
router.delete('/deleteInvoice', authorize(DIETITIAN), invoiceController.deleteInvoice);
router.put('/updateInvoice', authorize(DIETITIAN), invoiceController.updateInvoice);
router.post('/addInvoice', authorize(DIETITIAN), invoiceController.addInvoice);

module.exports = router;