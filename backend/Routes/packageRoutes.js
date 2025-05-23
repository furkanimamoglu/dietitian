const path = require('path');
const express = require('express');

const router = express.Router();

const packageController = require(path.join(__dirname, '..', 'Controller', 'packageController'));

router.get('/getMyPackages', packageController.getMyPackages);
router.post('/addPackage', packageController.addPackage);
router.put('/updatePackage', packageController.updatePackage);
router.delete('/deletePackage', packageController.deletePackage);

router.get('/getPackageItemsFromPackage', packageController.getPackageItemsFromPackage);
router.post('/addPackageItem', packageController.addPackageItem);
router.put('/updatePackageItem', packageController.updatePackageItem);
router.delete('/deletePackageItem', packageController.deletePackageItem);

module.exports = router;