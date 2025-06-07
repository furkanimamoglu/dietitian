const path = require('path');
const express = require('express');
const router = express.Router();

const dietitianController = require(path.join(__dirname, '..', 'Controller', 'dietitianController'));

router.post('/login', dietitianController.login);
router.post('/register', dietitianController.register);

router.put('/changePassword', dietitianController.changePassword);
router.put('/updatePhoneNumber', dietitianController.updatePhoneNumber);
router.put('/changeMail', dietitianController.changeMail);
router.post('/verifyEmail', dietitianController.verifyEmail);
router.post('/changeClientStatus', dietitianController.changeClientStatus);

router.get('/getDietitianInfo', dietitianController.getDietitianInfo);

router.post('/registerClient', dietitianController.registerClient);
router.delete('/deleteClient', dietitianController.deleteClient);
router.put('/updateClient', dietitianController.updateClient);
router.get('/getMyClient', dietitianController.getMyClient);
router.get('/getAllMyClients', dietitianController.getAllMyClients);
router.get('/getMyActiveClientCount', dietitianController.getMyActiveClientCount);

router.get('/globalSearchbar', dietitianController.globalSearchbar);

router.get('/getDietitianQR', dietitianController.createMyQR);
router.get('/getDietitianNameById', dietitianController.getDietitianNameById);

router.get('/getMyNotes', dietitianController.getMyNotes);
router.post('/addNote', dietitianController.addNote);
router.delete('/deleteNote', dietitianController.deleteNote);

module.exports = router;