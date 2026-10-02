const path = require("path");

const AnamnesService = require(path.join(__dirname, "..", "Service", "AnamnesService"));


class anamnesController {

    static async getAnamnes(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const result = await AnamnesService.getAnamnes(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateAnamnes(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const {saglik_bilgileri, diyet_aliskanliklari, fiziksel_aktivite, ozel_notlar} = req.body;

            const result = await AnamnesService.updateAnamnes(dietitian_id, client_id,
                {
                    saglik_bilgileri, diyet_aliskanliklari, fiziksel_aktivite, ozel_notlar
                });
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = anamnesController;