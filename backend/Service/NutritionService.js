const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {
    sequelize,
    Client,
    NutritionAssignment,
    NutritionCategory,
    NutritionPlan,
    Water
} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

const {Op} = require("sequelize");

class NutritionService {

    static async addNutritionCategory(dietitian_id, category_name) {
        if (!dietitian_id) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Yetkisiz Erişim."
            };
        }

        if (!category_name) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Kategori adı boş olamaz."
            };
        }

        return await NutritionCategory.create({
            name: category_name,
            dietitian_id
        });
    }

    static async getNutritionCategories(dietitian_id) {
        if (!dietitian_id) {
            throw {
                status: 401,
                showOnScreen: true,
                message: "Diyetisyen kimliği geçersiz."
            };
        }

        return await NutritionCategory.findAll({
            where: {dietitian_id},
            order: [['id', 'ASC']]
        });
    }

    static async assignNutritionPlanToClient({dietitian_id, client_id, nutrition_plan_id, start_date, end_date, note}) {
        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Bu danışan size ait değil. Atama yapılamaz.", 401, true);
        }

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id: dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil. Atama yapılamaz.", 401, true);
        }

        const existingAssignment = await NutritionAssignment.findOne({
            where: {
                client_id,
                [Op.or]: [
                    {
                        start_date: {[Op.between]: [start_date, end_date]}
                    },
                    {
                        end_date: {[Op.between]: [start_date, end_date]}
                    },
                    {
                        start_date: {[Op.lte]: start_date},
                        end_date: {[Op.gte]: end_date}
                    }
                ]
            }
        });

        if (existingAssignment) {
            throw new Exception("Bu tarih aralığında danışana atanmış başka bir plan zaten var.", 409, true);
        }

        let updatedMealPlan = null;
        if (plan.mealPlan) {
                updatedMealPlan = plan.mealPlan;

                Object.keys(updatedMealPlan).forEach(day => {
                    Object.keys(updatedMealPlan[day]).forEach(mealType => {
                        const mealTypeData = updatedMealPlan[day][mealType];

                        if (typeof mealTypeData === 'object') {
                            Object.keys(mealTypeData).forEach(menu => {
                                if (Array.isArray(mealTypeData[menu])) {
                                    mealTypeData[menu] = mealTypeData[menu].map(meal => {
                                        return { ...meal, eaten: false };
                                    });
                                }
                            });
                        } else if (Array.isArray(mealTypeData)) {
                            updatedMealPlan[day][mealType] = mealTypeData.map(meal => {
                                return { ...meal, eaten: false };
                            });
                        }
                    });
                });

            return await NutritionAssignment.create({
                client_id,
                nutrition_plan_id,
                start_date,
                end_date,
                note,
                mealPlan: updatedMealPlan
            });
        }
    }

    static async assignCustomPlanToClient(client_id, mealPlan, start_date, end_date, note) {
        if (!client_id || !mealPlan || !start_date || !end_date) {
            throw new Exception("Eksik parametreler.", 400, true);
        }

        return await sequelize.transaction(async (transaction) => {
            /* Danışan satırı kilitlenir ki aynı danışana eş zamanlı gelen ikinci istek
            bu transaction bitene kadar burada beklesin. Böylece iki istek kontrolü birlikte geçip
            çakışan iki plan oluşturamaz. Farklı danışanlara gelen istekler birbirini beklemez. */
            const client = await Client.findByPk(client_id, {lock: true, transaction});

            if (!client) {
                throw new Exception("Bu danışan bulunamadı.", 404, true);
            }

            const existingAssignment = await NutritionAssignment.findOne({
                where: {
                    client_id: client_id,
                    [Op.or]: [
                        { start_date: { [Op.between]: [start_date, end_date] } },
                        { end_date: { [Op.between]: [start_date, end_date] } },
                        { start_date: { [Op.lte]: start_date }, end_date: { [Op.gte]: end_date } }
                    ]
                },
                transaction
            });

            if (existingAssignment) {
                throw new Exception("Bu tarih aralığında danışana atanmış başka bir plan zaten var.", 409, true);
            }

            return await NutritionAssignment.create({
                client_id,
                mealPlan,
                start_date,
                end_date,
                note
            }, {transaction});
        });
    }

    static async getNutritionPlans(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await NutritionPlan.findAll({
            where: {dietitian_id},
            order: [['id', 'ASC']]
        });
    }

    static async deleteNutritionCategory(dietitian_id, category_id) {
        if (!dietitian_id || !category_id) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Geçersiz istek. Diyetisyen veya kategori bilgisi eksik."
            };
        }

        const category = await NutritionCategory.findOne({
            where: {
                id: category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw {
                status: 403,
                showOnScreen: true,
                message: "Bu kategori size ait değil veya bulunamadı."
            };
        }

        await category.destroy();

        return {
            success: true,
            message: "Kategori başarıyla silindi."
        };
    }

    static async deleteNutritionPlan(dietitian_id, nutrition_plan_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id: dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil veya bulunamadı.", 403, true);
        }

        await plan.destroy();

        return {success: true, message: "Beslenme planı başarıyla silindi."};
    }

    static async addNutritionPlan(dietitian_id, {title, description, image, category_id, mealPlan}) {
        if (!dietitian_id || !title || !category_id) {
            throw new Exception("Başlık, açıklama ve kategori zorunludur.", 400, true);
        }

        const category = await NutritionCategory.findOne({
            where: {
                id: category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw new Exception("Bu kategori size ait değil.", 403, true);
        }

        const existing = await NutritionPlan.findOne({
            where: {
                title,
                dietitian_id
            }
        });

        if (existing) {
            throw new Exception("Bu isimde bir plan zaten mevcut.", 409, true);
        }

        if (mealPlan && typeof mealPlan !== 'object') {
            throw new Exception("Meal plan geçerli bir JSON formatında olmalıdır.", 400, true);
        }

        return await NutritionPlan.create({
            title,
            description,
            image: image || '/placeholder.png',
            category_id,
            mealPlan,
            dietitian_id
        });
    }

    static async updateNutritionPlan(dietitian_id, nutrition_plan_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const {title, description, image, category_id, mealPlan} = updateData;

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil veya bulunamadı.", 403, true);
        }

        if (mealPlan) {
            if (typeof mealPlan !== 'object') {
                throw new Exception("mealPlan geçerli bir JSON formatında olmalıdır.", 400, true);
            }
        }

        await plan.update({
            title: title ?? plan.title,
            description: description ?? plan.description,
            image: image ?? plan.image,
            category_id: category_id ?? plan.category_id,
            mealPlan: mealPlan ?? plan.mealPlan
        });

        return plan;
    }

    static async getNutritionAssignmentPlanByClient(dietitian_id, client_id, startDate, endDate) {
        return await NutritionAssignment.findAll({
            where: {
                client_id,
                ...(startDate && endDate && {
                    start_date: {[Op.lte]: endDate},
                    end_date: {[Op.gte]: startDate}
                })
            },
            order: [['start_date', 'ASC']]
        });
    }

    static async getClientNutritionPlans(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await NutritionAssignment.findAll({
            where: {client_id},
        });
    }

    static async deleteNutritionAssignment(dietitian_id, assignment_id) {
        if (!dietitian_id || !assignment_id) {
            throw new Exception("Eksik parametreler.", 400, true);
        }

        const assignment = await NutritionAssignment.findOne({
            where: {
                id: assignment_id
            },
            include: [{
                model: Client,
                where: {
                    dietitian_id: dietitian_id
            }
            }]
        });

        if (!assignment) {
            throw new Exception("Bu atama size ait değil veya bulunamadı.", 403, true);
        }

        await assignment.destroy();

        return {success: true, message: "Beslenme ataması başarıyla silindi."};
    }

    static async getClientWater(client_id, start_date = null, end_date = null) {

        return await Water.findAll({
            where: {
                client_id,
                ...(start_date && end_date && {
                    date: {[Op.between]: [start_date, end_date]}
                }),
                ...(start_date && !end_date && {
                    date: {[Op.gte]: start_date}
                }),
                ...(end_date && !start_date && {
                    date: {[Op.lte]: end_date}
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

    static async updateClientWaterGoal(dietitian_id, client_id, daily_goal) {
        if (!dietitian_id || !client_id || !daily_goal) {
            throw new Exception("Eksik parametreler.", 400, true);
        }

        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Bu danışan size ait değil.", 401, true);
        }

        client.dailyWaterIntake = daily_goal;
        await client.save();

        return client;
    }

}

module.exports = NutritionService;
