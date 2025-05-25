const path = require("path");

const NutritionService = require(path.join(__dirname, "..", "Service", "NutritionService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {DIETITIAN} = require(path.join(__dirname, "..", "Enum", "Role"));

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

}

module.exports = nutritionController;