const path = require('path');
const express = require('express');
const router = express.Router();

const dietitianController = require(path.join(__dirname, '..', 'Controller', 'dietitianController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.post('/login', dietitianController.login);
router.post('/register', dietitianController.register);

router.put('/changePassword', authorize(DIETITIAN), dietitianController.changePassword);
router.put('/updatePhoneNumber', authorize(DIETITIAN), dietitianController.updatePhoneNumber);
router.put('/changeMail', authorize(DIETITIAN), dietitianController.changeMail);
router.post('/verifyEmail', dietitianController.verifyEmail);
router.post('/changeClientStatus', authorize(DIETITIAN), dietitianController.changeClientStatus);

router.get('/getDietitianInfo', authorize(DIETITIAN), dietitianController.getDietitianInfo);

router.get('/getDietitianSubscriptionDetails', dietitianController.getDietitianSubscriptionDetails);

router.post('/registerClient', authorize(DIETITIAN), dietitianController.registerClient);
router.delete('/deleteClient', authorize(DIETITIAN), dietitianController.deleteClient);
router.put('/updateClient', authorize(DIETITIAN), dietitianController.updateClient);
router.get('/getMyClient', authorize(DIETITIAN), dietitianController.getMyClient);
router.get('/getAllMyClients', authorize(DIETITIAN), dietitianController.getAllMyClients);
router.get('/getMyActiveClientCount', authorize(DIETITIAN), dietitianController.getMyActiveClientCount);

router.post('/changeDietitianSubscriptionToFree', authorize(DIETITIAN), dietitianController.changeDietitianSubscriptionToFree);

router.put('/updateApprovalSettings', authorize(DIETITIAN), dietitianController.updateApprovalSettings);

router.post('/updateClientWaterLimit', authorize(DIETITIAN), dietitianController.updateClientWaterLimit);

router.get('/globalSearchbar', authorize(DIETITIAN), dietitianController.globalSearchbar);

router.get('/getDietitianQR', authorize(DIETITIAN), dietitianController.createMyQR);
router.get('/getDietitianNameById', dietitianController.getDietitianNameById);

router.get('/getMyNotes', authorize(DIETITIAN), dietitianController.getMyNotes);
router.post('/addNote', authorize(DIETITIAN), dietitianController.addNote);
router.delete('/deleteNote', authorize(DIETITIAN), dietitianController.deleteNote);

router.put('/updateClientNote', authorize(DIETITIAN), dietitianController.updateClientNote);

module.exports = router;