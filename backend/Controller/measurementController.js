const path = require("path");

const measurementService = require(path.join(__dirname, "..", "Service", "MeasurementService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));

class measurementController {

    static async getClientMeasurement(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            if (!client_id) {
                return res.status(400).json({
                    message: "client_id zorunludur."
                });
            }

            const result = await measurementService.getClientMeasurement(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async createMeasurement(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id, boy, kilo, bel, digerbel, kalca, gogus, kol, bacak, yag, kas, su} = req.body;

            if (!client_id) {
                return res.status(400).json({
                    message: "Danışan id çekilemedi."
                });
            }

            const result = await measurementService.createMeasurement(dietitian_id, client_id, {
                boy,
                kilo,
                bel,
                digerbel,
                kalca,
                gogus,
                kol,
                bacak,
                yag,
                kas,
                su
            });

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async updateMeasurement(req, res) {
        try {
            const dietitian_id = req.user.id;

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
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async deleteMeasurement(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {measurement_id} = req.query;

            if (!measurement_id) {
                return res.status(400).json({
                    message: "measurement_id zorunludur."
                });
            }

            const result = await measurementService.deleteMeasurement(dietitian_id, measurement_id);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

}

module.exports = measurementController;