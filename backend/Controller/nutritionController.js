const path = require("path");

const NutritionService = require(path.join(__dirname, "..", "Service", "NutritionService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));
const moment = require("moment/moment");

class nutritionController {

    static async addNutritionCategory(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {category_name} = req.body;

            const result = await NutritionService.addNutritionCategory(dietitian_id, category_name);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getNutritionCategories(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {category_name} = req.body;

            const result = await NutritionService.getNutritionCategories(dietitian_id, category_name);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async deleteNutritionCategory(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {category_id} = req.query;

            if (!category_id) {
                return res.status(400).json({
                    message: "Geçersiz istek. Kategori id eksik."
                });
            }
            const result = await NutritionService.deleteNutritionCategory(dietitian_id, category_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async assignNutritionPlanToClient(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id, nutrition_plan_id, start_date, end_date, note} = req.body;

            if (!dietitian_id || !client_id || !nutrition_plan_id || !start_date || !end_date) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm alanlar zorunludur."
                });
            }

            const result = await NutritionService.assignNutritionPlanToClient({
                dietitian_id,
                client_id,
                nutrition_plan_id,
                start_date,
                end_date,
                note
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

    static async assignCustomPlanToClient(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id, mealPlan, start_date, end_date, note} = req.body;

            if (!client_id || !mealPlan || !start_date || !end_date) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm alanlar zorunludur."
                });
            }

            const result = await NutritionService.assignCustomPlanToClient(
                client_id,
                mealPlan,
                start_date,
                end_date,
                note
            );

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async deleteNutritionAssignment(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {assignment_id} = req.query;

            if (!assignment_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Assignment ID eksik."
                });
            }

            const result = await NutritionService.deleteNutritionAssignment(dietitian_id, assignment_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getNutritionPlans(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await NutritionService.getNutritionPlans(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async deleteNutritionPlan(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {nutrition_plan_id} = req.query;

            const result = await NutritionService.deleteNutritionPlan(dietitian_id, nutrition_plan_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async addNutritionPlan(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {title, description, image, category_id, mealPlan} = req.body;

            const result = await NutritionService.addNutritionPlan(dietitian_id, {
                title,
                description,
                image,
                category_id,
                mealPlan
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

    static async updateNutritionPlan(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {nutrition_plan_id, title, description, image, category_id, mealPlan} = req.body;

            const result = await NutritionService.updateNutritionPlan(
                dietitian_id,
                nutrition_plan_id,
                {title, description, image, category_id, mealPlan}
            );

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getNutritionAssignmentPlanByClient(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id, range} = req.body;

            if (!client_id || !range) {
                return res.status(400).json({message: "client_id ve range zorunludur."});
            }

            let startDate, endDate;
            const now = moment();

            switch (range) {
                case 'day':
                    startDate = now.clone().startOf('day').toDate();
                    endDate = now.clone().endOf('day').toDate();
                    break;
                case 'week':
                    startDate = now.clone().startOf('isoWeek').toDate();
                    endDate = now.clone().endOf('isoWeek').toDate();
                    break;
                case 'month':
                    startDate = now.clone().startOf('month').toDate();
                    endDate = now.clone().endOf('month').toDate();
                    break;
                case 'all':
                    startDate = null;
                    endDate = null;
                    break;
                default:
                    return res.status(400).json({message: "Geçersiz range: 'day', 'week' veya 'month' olmalı."});
            }

            const plans = await NutritionService.getNutritionAssignmentPlanByClient(
                dietitian_id,
                client_id,
                startDate,
                endDate
            );

            return res.status(200).json(plans);
        } catch (error) {
            logError(req, error);
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async getClientNutritionPlans(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const result = await NutritionService.getClientNutritionPlans(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientWater(req, res) {
        try {
            const user_id = req.user.id;
            const isClient = req.user.role === CLIENT;
            const isDietitian = req.user.role === DIETITIAN;

            let client_id;

            if (isClient) {
                client_id = user_id;
            } else if (isDietitian) {
                client_id = req.query.client_id;
                if (!client_id) {
                    return res.status(400).json({
                        showOnScreen: true,
                        message: "Danışan bilgisi eksik."
                    });
                }
            } else {
                return res.status(403).json({
                    showOnScreen: true,
                    message: "Bu işlemi yapma yetkiniz yok."
                });
            }

            const {start_date, end_date} = req.body;

            const result = await NutritionService.getClientWater(client_id, start_date, end_date);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async addClientWater(req, res) {
        try {
            const client_id = req.user.id;

            const {amount} = req.body;
            const date = moment().format('YYYY-MM-DD');

            if (!amount || !date) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Su için miktar girmediniz."
                });
            }

            const result = await NutritionService.addClientWater(client_id, amount, date);

            res.status(201).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async deleteClientWater(req, res) {
        try {
            const client_id = req.user.id;

            const {water_id} = req.query;

            const result = await NutritionService.deleteClientWater(client_id, water_id);

            res.status(201).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async updateClientWaterGoal(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id, daily_goal} = req.body;

            if (!daily_goal) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Hedef miktar belirtilmemiş."
                });
            }

            if(!client_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Danışan ID belirtilmemiş."
                });
            }

            const result = await NutritionService.updateClientWaterGoal(dietitian_id, client_id, daily_goal);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

}

module.exports = nutritionController;