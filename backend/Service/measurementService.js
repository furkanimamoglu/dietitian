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

    static async createMeasurement(dietitian_id, client_id, measurementData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const clientData = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!clientData) {
            throw new Exception("Danışan bulunamadı.", 404, true);
        }

        return await Measurement.create({
            client_id: client_id,
            ...measurementData
        });
    }

    static async updateMeasurement(dietitian_id, measurement_id, client_id, measurementData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const clientData = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!clientData) {
            throw new Exception("Danışan bulunamadı.", 404, true);
        }

        const measurement = await Measurement.findOne({
            where: {
                id: measurement_id,
                client_id: client_id
            }
        });

        if (!measurement) {
            throw new Exception("Ölçüm bulunamadı.", 404, true);
        }

        await measurement.update(measurementData);

        return measurement;
    }

    static async deleteMeasurement(dietitian_id, measurement_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const measurement = await Measurement.findOne({
            where: {
                id: measurement_id
            }
        });

        if (!measurement) {
            throw new Exception("Ölçüm bulunamadı.", 404, true);
        }

        const client = await Client.findOne({
            where: {
                id: measurement.client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Danışan bulunamadı.", 404, true);
        }

        await measurement.destroy();

        return {
            showOnScreen: true,
            message: "Ölçüm başarıyla silindi."
        };
    }

}

module.exports = MeasurementService;
