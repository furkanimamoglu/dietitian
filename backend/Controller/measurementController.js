const path = require("path");

const measurementService = require(path.join(__dirname, "..", "Service", "MeasurementService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {DIETITIAN} = require(path.join(__dirname, "..", "Enum", "Role"));

class measurementController {

    static async getClientMeasurement(req, res) {
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

    static async createMeasurement(req, res) {
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

            const {client_id, boy, kilo, bel, kalca, gogus, yag, kas, su} = req.body;

            if (!client_id || !boy || !kilo || !bel || !kalca || !gogus || !yag || !kas || !su) {
                return res.status(400).json({
                    message: "Tüm alanlar zorunludur."
                });
            }

            const result = await measurementService.createMeasurement(dietitian_id, client_id, {
                boy,
                kilo,
                bel,
                kalca,
                gogus,
                yag,
                kas,
                su
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async updateMeasurement(req, res) {
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

            const {measurement_id, client_id, boy, kilo, bel, kalca, gogus, yag, kas, su} = req.body;

            if (!measurement_id || !client_id || !boy || !kilo || !bel || !kalca || !gogus || !yag || !kas || !su) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm alanlar zorunludur."
                });
            }

            const result = await measurementService.updateMeasurement(dietitian_id, measurement_id, client_id, {
                boy,
                kilo,
                bel,
                kalca,
                gogus,
                yag,
                kas,
                su
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async deleteMeasurement(req, res) {
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

            const {measurement_id} = req.query;

            if (!measurement_id) {
                return res.status(400).json({
                    message: "measurement_id zorunludur."
                });
            }

            const result = await measurementService.deleteMeasurement(dietitian_id, measurement_id);

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