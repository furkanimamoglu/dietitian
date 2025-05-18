const {Anamnes} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");

class AnamnesService {

    static async getClientAnamnes(dietitian_id, client_id) {
        try {
            const anamnes = await Anamnes.findAll({
                where: {
                    dietitian_id: dietitian_id,
                    client_id: client_id
                }
            });

            if (!anamnes) {
                throw new Exception('Anamnes bulunamadı.', 404, true);
            }

            return anamnes;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

}

module.exports = AnamnesService;