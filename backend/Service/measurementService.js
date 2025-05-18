const Exception = require("../Exception/Exception");
const { Measurement, Client} = require("../Model/MainModel");

class MeasurementService {

    static async getClientMeasurement(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Danışan bulunamadı.", 404, true);
        }

        return await Measurement.findAll({
            where: { client_id },
            order: [['createdAt', 'DESC']]
        });
    }

}

module.exports = MeasurementService;
