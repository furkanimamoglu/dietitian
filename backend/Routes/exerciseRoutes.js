const path = require('path');
const express = require('express');

const router = express.Router();

const exerciseController = require(path.join(__dirname, '..', 'Controller', 'exerciseController'));
const {authorize} = require(path.join(__dirname, '..', 'Middleware', 'Auth'));
const {DIETITIAN} = require(path.join(__dirname, '..', 'Enum', 'Role'));

router.get('/getMyExercises', authorize(DIETITIAN), exerciseController.getMyExercises);
router.post('/addExercise', authorize(DIETITIAN), exerciseController.addExercise);
router.put('/updateExercise', authorize(DIETITIAN), exerciseController.updateExercise);
router.delete('/deleteExercise', authorize(DIETITIAN), exerciseController.deleteExercise);

router.get('/getClientExercises', authorize(DIETITIAN), exerciseController.getClientExercises);
router.post('/assignExercise', authorize(DIETITIAN), exerciseController.assignExercise);
router.get('/getAssignedExercisesByClient', authorize(DIETITIAN), exerciseController.getAssignedExercisesByClient);
router.get('/getClientExerciseHistory', authorize(DIETITIAN), exerciseController.getClientExerciseHistory);
router.delete('/deleteExerciseAssignment', authorize(DIETITIAN), exerciseController.deleteExerciseAssignment);

router.get('/getMyExerciseCategories', authorize(DIETITIAN), exerciseController.getMyExerciseCategories);
router.post('/addExerciseCategory', authorize(DIETITIAN), exerciseController.addExerciseCategory);
router.put('/updateExerciseCategory', authorize(DIETITIAN), exerciseController.updateExerciseCategory);
router.delete('/deleteExerciseCategory', authorize(DIETITIAN), exerciseController.deleteExerciseCategory);

module.exports = router;