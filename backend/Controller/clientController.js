const moment = require('moment');
const path = require("path");

const ClientService = require(path.join(__dirname, "..", "Service", "ClientService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const { CLIENT } = require(path.join(__dirname, "..", "Enum", "Role"));

class ClientController {

    static async login(req, res) {
        try {
            const {phoneNumber, password} = req.body;

            const result = await ClientService.login(phoneNumber, password);

            res.status(200).json(
                {
                    token: result.token,
                    role: result.role
                }
            );
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async register(req, res) {
        try {
            const {phoneNumber, password, name, dietitian_id} = req.body;
            const ipAddress = req.ip;

            if (!dietitian_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Bağlı olunan bir diyetisyen bulunamadı.'
                });
            }

            if (!phoneNumber || !password || !ipAddress) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await ClientService.register(dietitian_id, name, phoneNumber, password, ipAddress);

            res.status(200).json({
                token: result.token,
                role: result.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async getClientInfo(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getClientInfo(client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getMyNotifications(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getMyNotifications(client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async readMyAllNotifications(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.readMyAllNotifications(client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getTodayMeal(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const today = moment().format('YYYY-MM-DD');
            const dayName = moment().locale('tr').format('dddd');

            const result = await ClientService.getTodayMeal(client_id, today, dayName);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getMyLatestMeasurement(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getMyLatestMeasurement(client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async updateMealPlan(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {nutrition_plan_id, mealPlan} = req.body;

            if (!nutrition_plan_id || !mealPlan) {
                return res.status(400).json({
                    success: false,
                    message: "clientId, nutritionPlanId ve mealPlan alanları zorunludur."
                });
            }

            const result = await ClientService.updateMealPlan(client_id, nutrition_plan_id, mealPlan);

            return res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getMyKVKKStatus(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getMyKVKKStatus(client_id);

            return res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async approveKVKK(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.approveKVKK(client_id);

            return res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getMyDailyExercises(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getMyDailyExercises(client_id);

            return res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateMyExercise(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, CLIENT);

            if (!token || !client_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {exercise_id, status, duration} = req.body;

            const result = await ClientService.updateMyExercise(client_id, exercise_id, status, duration);

            return res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = ClientController;