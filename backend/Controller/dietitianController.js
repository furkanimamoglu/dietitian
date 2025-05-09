const DietitianService = require("../Service/dietitianService");
require("../Exception/Exception");
const Security = require("../Utils/Security");

class DietitianController {

    async login(req, res) {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.login(email, password);

            res.status(200).json({
                token: result.token,
                role: result.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async register(req, res) {
        try {
            const {email, password} = req.body;
            const ipAddress = req.ip;

            if (!email || !password || !ipAddress) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.register(email, password, ipAddress);

            res.status(200).json({
                token: result.token,
                role: result.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async registerClient(req, res) {
        try {
            const {name, email, password, phoneNumber, gender} = req.body;

            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            if (!phoneNumber || !password || !name) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.registerClient(user_id, name, email, password, phoneNumber, gender);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async deleteClient(req, res) {
        const token = req.headers.authorization;
        const user_id = Security.getUserIdFromToken(token);
        if (!token || !user_id) {
            return res.status(401).json({
                message: "Yetkisiz erişim."
            });
        }

        try {
            const {client_id} = req.body;

            if (!client_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.deleteClient(user_id, client_id);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async updateClient(req, res) {
        const token = req.headers.authorization;
        const user_id = Security.getUserIdFromToken(token);
        if (!token || !user_id) {
            return res.status(401).json({
                message: "Yetkisiz erişim."
            });
        }

        try {
            const { id, name, email, phoneNumber, gender, status } = req.body;

            if (!id || !name || !phoneNumber || !status) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm parametreler doldurulmalıdır."
                });
            }

            const updateData = { name, email, phoneNumber, gender, status };

            const result = await DietitianService.updateClient(user_id, id, updateData);
            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || false,
                message: err.message || "Bir hata oluştu.",
            });
        }
    }

    async createMyQR(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const qrData = await DietitianService.generateQrCode(user_id);

            return res.status(200).json({
                qrData
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    async getMyClient(req, res) {
        try {
            const token = req.headers.authorization;
            const { client_id } = req.query;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getMyClient(user_id, client_id)
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    async getAllMyClients(req, res) {
        try {
            //TODO: Client olarak bearer tokenimle çektiğimde, verilerim geliyor? Bağlı olduğu diyetisyenin clientlerini çekemiyor olması gerekiyor.
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getMyAllClients(user_id)
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    async globalSearchbar(req, res) {
        try {
            const token = req.headers.authorization;
            const { search } = req.query;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.globalSearchbar(user_id, search);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async getDietitianInfo(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getDietitianInfo(user_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async getDietitianNameById(req, res) {
        try {
            const { dietitian_id } = req.query;
            const result = await DietitianService.getDietitianNameById(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async addNutritionCategory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { category_name } = req.body;
            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.addNutritionCategory(dietitian_id, category_name);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async getNutritionCategories(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { category_name } = req.body;
            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getNutritionCategories(dietitian_id, category_name);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async deleteNutritionCategory(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { category_id } = req.query;

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            if(!category_id) {
                return res.status(400).json({
                    message: "Geçersiz istek. Kategori id eksik."
                });
            }
            const result = await DietitianService.deleteNutritionCategory(dietitian_id, category_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    async assignNutritionPlanToClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { client_id, nutrition_plan_id, start_date, end_date, note } = req.body;

            if (!dietitian_id || !client_id || !nutrition_plan_id || !start_date || !end_date) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm alanlar zorunludur."
                });
            }

            const result = await DietitianService.assignNutritionPlanToClient({
                dietitian_id,
                client_id,
                nutrition_plan_id,
                start_date,
                end_date,
                note
            });

            res.status(200).json(result);

        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async getNutritionPlans(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getNutritionPlans(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async deleteNutritionPlan(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { nutrition_plan_id } = req.query;

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.deleteNutritionPlan(dietitian_id, nutrition_plan_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async addNutritionPlan(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { title, description, image, category_id, mealPlan } = req.body;

            const result = await DietitianService.addNutritionPlan(dietitian_id, {
                title,
                description,
                image,
                category_id,
                mealPlan
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

}

module.exports = new DietitianController();
