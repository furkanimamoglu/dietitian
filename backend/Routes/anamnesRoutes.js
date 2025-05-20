const express = require('express');

const router = express.Router();

const anamnesController = require('../Controller/anamnesController');

router.get('/getAnamnes', anamnesController.getAnamnes);
router.put('/updateAnamnesSaglik', anamnesController.updateAnamnesSaglik);
router.put('/updateAnamnesDiyetAliskanlik', anamnesController.updateAnamnesDiyetAliskanlik);
router.put('/updateAnamnesFizikselAktivite', anamnesController.updateAnamnesFizikselAktivite);
router.put('/updateAnamnesOzelNotlar', anamnesController.updateAnamnesOzelNotlar);

module.exports = router;