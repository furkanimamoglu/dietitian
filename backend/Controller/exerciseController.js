const path = require("path");

const ExerciseService = require(path.join(__dirname, "..", "Service", "ExerciseService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {DIETITIAN} = require(path.join(__dirname, "..", "Enum", "Role"));

class exerciseController {

    static async getMyExercises(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ExerciseService.getMyExercises(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientExercises(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const result = await ExerciseService.getClientExercises(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addExercise(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {
                category_id,
                exercise_name,
                exercise_description,
                image,
                duration,
                difficulty,
                equipment,
                calories_burned
            } = req.body;

            const result = await ExerciseService.addExercise(dietitian_id, {
                category_id,
                exercise_name,
                exercise_description,
                image,
                duration,
                difficulty,
                equipment,
                calories_burned
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateExercise(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {
                exercise_id,
                exercise_name,
                exercise_description,
                category_id,
                image,
                duration,
                difficulty,
                equipment,
                calories_burned
            } = req.body;

            const result = await ExerciseService.updateExercise(dietitian_id, exercise_id, {
                exercise_name,
                exercise_description,
                category_id,
                image,
                duration,
                difficulty,
                equipment,
                calories_burned
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteExercise(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_id} = req.query;

            const result = await ExerciseService.deleteExercise(dietitian_id, exercise_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getAssignedExercisesByClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const result = await ExerciseService.getAssignedExercisesByClient(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteExerciseAssignment(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_assignment_id} = req.query;

            const result = await ExerciseService.deleteExerciseAssignment(dietitian_id, exercise_assignment_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async assignExercise(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_id, client_id, start_date, end_date, note} = req.body;

            const result = await ExerciseService.assignExercise(dietitian_id, exercise_id, client_id, start_date, end_date, note);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getMyExerciseCategories(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ExerciseService.getMyExerciseCategories(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addExerciseCategory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_category_name} = req.body;

            const result = await ExerciseService.addExerciseCategory(dietitian_id, exercise_category_name);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateExerciseCategory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_category_id, exercise_category_name} = req.body;

            const result = await ExerciseService.updateExerciseCategory(dietitian_id, exercise_category_id, exercise_category_name);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteExerciseCategory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_category_id} = req.query;

            const result = await ExerciseService.deleteExerciseCategory(dietitian_id, exercise_category_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientExerciseHistory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id, start_date, end_date} = req.query;

            const result = await ExerciseService.getClientExerciseHistory(dietitian_id, client_id, start_date, end_date);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = exerciseController;
