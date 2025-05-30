const path = require("path");

const NutritionService = require(path.join(__dirname, "..", "Service", "NutritionService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {DIETITIAN, CLIENT} = require(path.join(__dirname, "..", "Enum", "Role"));
const moment = require("moment/moment");

class nutritionController {

    static async getClientNutritionPlans(req, res) {
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

            const result = await NutritionService.getClientNutritionPlans(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientWater(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            const isClient = Security.checkUserPermission(token, CLIENT);
            const isDietitian = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !user_id) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            let client_id;

            if (isClient) {
                client_id = user_id;
            } else if (isDietitian) {
                client_id = req.query.client_id;
                if (!client_id) {
                    return res.status(400).json({
                        showOnScreen: true,
                        message: "Danışan bilgisi eksik."
                    });
                }
            } else {
                return res.status(403).json({
                    showOnScreen: true,
                    message: "Bu işlemi yapma yetkiniz yok."
                });
            }

            const { start_date, end_date } = req.body;

            const result = await NutritionService.getClientWater(client_id, start_date, end_date);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async addClientWater(req, res) {
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

            const { amount } = req.body;
            const date = moment().format('YYYY-MM-DD');

            if (!amount || !date) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Su için miktar girmediniz."
                });
            }

            const result = await NutritionService.addClientWater(client_id, amount, date);

            res.status(201).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async deleteClientWater(req, res) {
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

            const { water_id } = req.query;

            const result = await NutritionService.deleteClientWater(client_id, water_id);

            res.status(201).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

}

module.exports = nutritionController;