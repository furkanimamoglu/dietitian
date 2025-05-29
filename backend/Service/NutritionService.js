const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {NutritionAssignment, NutritionCategory, NutritionPlan, Water} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {Op} = require("sequelize");

class NutritionService {

    static async getClientNutritionPlans(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await NutritionAssignment.findAll({
            where: {client_id},
        });
    }

    static async getClientWater(client_id, start_date = null, end_date = null) {

        return await Water.findAll({
            where: {
                client_id,
                ...(start_date && end_date && {
                    date: { [Op.between]: [start_date, end_date] }
                }),
                ...(start_date && !end_date && {
                    date: { [Op.gte]: start_date }
                }),
                ...(end_date && !start_date && {
                    date: { [Op.lte]: end_date }
                }),
            }
        });
    }

    static async addClientWater(client_id, amount_ml, date) {
        if (!client_id || !amount_ml || !date) {
            throw new Exception("Eksik parametreler.", 400, true);
        }

        return await Water.create({
            client_id,
            amount_ml,
            date
        });
    }

    static async deleteClientWater(client_id, water_id) {
        if (!client_id || !water_id) {
            throw new Exception("Eksik parametreler.", 400, true);
        }

        const waterRecord = await Water.findOne({
            where: {
                id: water_id,
                client_id
            }
        });

        if (!waterRecord) {
            throw new Exception("Su kaydı bulunamadı.", 404, true);
        }

        return await waterRecord.destroy();
    }

}

module.exports = NutritionService;
