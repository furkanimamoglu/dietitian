const path = require('path');
const express = require('express');

const router = express.Router();

const exerciseController = require(path.join(__dirname, '..', 'Controller', 'exerciseController'));

router.get('/getMyExercises', exerciseController.getMyExercises);
router.post('/addExercise', exerciseController.addExercise);
router.put('/updateExercise', exerciseController.updateExercise);
router.delete('/deleteExercise', exerciseController.deleteExercise);
router.post('/assignExercise', exerciseController.assignExercise);
router.get('/getAssignedExercisesByClient', exerciseController.getAssignedExercisesByClient);
router.delete('/deleteExerciseAssignment', exerciseController.deleteExerciseAssignment);

router.get('/getMyExerciseCategories', exerciseController.getMyExerciseCategories);
router.post('/addExerciseCategory', exerciseController.addExerciseCategory);
router.put('/updateExerciseCategory', exerciseController.updateExerciseCategory);
router.delete('/deleteExerciseCategory', exerciseController.deleteExerciseCategory);

module.exports = router;