const measurementService = require("../Service/measurementService");
const Security = require("../Utils/Security");

class measurementController {

    static async getClientMeasurement(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.getPermissionFromToken(token);

            if (!token || !dietitian_id && permission !== "DIETITIAN") {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const { client_id } = req.query;

            if (!client_id) {
                return res.status(400).json({
                    message: "client_id zorunludur."
                });
            }

            const result = await measurementService.getClientMeasurement(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

}

module.exports = measurementController;