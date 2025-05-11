const ClientService = require("../Service/clientService");
const Security = require("../Utils/Security");
const moment = require('moment');


class ClientController {

    async login(req, res) {
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

    async register(req, res) {
        try {
            const {phoneNumber, password, name, dietitian_id} = req.body;
            const ipAddress = req.ip;

            if(!dietitian_id){
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

    async getClientInfo(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            // TODO: user_id yerine telefon numarasını unique yapalım
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await ClientService.getClientInfo(user_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async getMyNotifications(req, res) {
        try {
            const token = req.headers.authorization;
            const phoneNumber = Security.getPhoneNumberFromToken(token);
            if (!token || !phoneNumber) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await ClientService.getMyNotifications(phoneNumber);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async readMyAllNotifications(req, res) {
        try {
            const token = req.headers.authorization;
            const phoneNumber = Security.getPhoneNumberFromToken(token);
            if (!token || !phoneNumber) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await ClientService.readMyAllNotifications(phoneNumber);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async getTodayMeal(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);

            if (!token || !client_id) {
                return res.status(401).json({
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

    async updateMealPlan(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);
            const { nutrition_plan_id, mealPlan } = req.body;

            if (!token || !client_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

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

    async getMyKVKKStatus(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);

            if (!token || !client_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.getMyKVKKStatus(client_id);

            return res.status(200).json(result);
        } catch ( error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    async approveKVKK(req, res) {
        try {
            const token = req.headers.authorization;
            const client_id = Security.getUserIdFromToken(token);

            if (!token || !client_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await ClientService.approveKVKK(client_id);

            return res.status(200).json(result);
        } catch ( error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = new ClientController();