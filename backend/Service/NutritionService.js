const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {NutritionAssignment, NutritionCategory, NutritionPlan} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

class NutritionService {

    static async getClientNutritionPlans(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await NutritionAssignment.findAll({
            where: {client_id},
        });
    }

}

module.exports = NutritionService;
