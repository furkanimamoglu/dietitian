const path = require('path');
const express = require('express');

const router = express.Router();

const packageController = require(path.join(__dirname, '..', 'Controller', 'packageController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getMyPackages', authorize(DIETITIAN), packageController.getMyPackages);
router.post('/addPackage', authorize(DIETITIAN), packageController.addPackage);
router.put('/updatePackage', authorize(DIETITIAN), packageController.updatePackage);
router.delete('/deletePackage', authorize(DIETITIAN), packageController.deletePackage);

router.get('/getPackageItemsFromPackage', authorize(DIETITIAN), packageController.getPackageItemsFromPackage);
router.post('/addPackageItem', authorize(DIETITIAN), packageController.addPackageItem);
router.put('/updatePackageItem', authorize(DIETITIAN), packageController.updatePackageItem);
router.delete('/deletePackageItem', authorize(DIETITIAN), packageController.deletePackageItem);

module.exports = router;