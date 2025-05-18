const DietitianService = require("../Service/dietitianService");
require("../Exception/Exception");
const Security = require("../Utils/Security");
const moment = require("moment");
const {Notes} = require("../Model/MainModel");

class DietitianController {
    static async login(req, res) {
        try {
            const {phoneNumber, password} = req.body;

            if (!phoneNumber || !password) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.login(phoneNumber, password);

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

    static async register(req, res) {
        try {
            const {phoneNumber, password} = req.body;
            const ipAddress = req.ip;

            if (!phoneNumber || !password || !ipAddress) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.register(phoneNumber, password, ipAddress);

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

    static async registerClient(req, res) {
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

    static async deleteClient(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        if (!token || !dietitian_id) {
            return res.status(401).json({
                message: "Yetkisiz erişim."
            });
        }

        try {
            const { client_id } = req.body;

            if (!client_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.deleteClient(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async updateClient(req, res) {
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

    static async createMyQR(req, res) {
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

    static async getMyClient(req, res) {
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

    static async getAllMyClients(req, res) {
        try {
            //TODO: Client olarak bearer tokenimle çektiğimde, verilerim geliyor? Bağlı olduğu diyetisyenin clientlerini çekemiyor olması gerekiyor.
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getMyAllClients(dietitian_id);
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async globalSearchbar(req, res) {
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

    static async getDietitianInfo(req, res) {
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

    static async getDietitianNameById(req, res) {
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

    static async addNutritionCategory(req, res) {
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

    static async getNutritionCategories(req, res) {
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

    static async deleteNutritionCategory(req, res) {
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

    static async assignNutritionPlanToClient(req, res) {
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

    static async getNutritionPlans(req, res) {
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

    static async deleteNutritionPlan(req, res) {
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

    static async addNutritionPlan(req, res) {
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

    static async updateNutritionPlan(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { nutrition_plan_id, title, description, image, category_id, mealPlan } = req.body;

            const result = await DietitianService.updateNutritionPlan(
                dietitian_id,
                nutrition_plan_id,
                { title, description, image, category_id, mealPlan }
            );

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getMyActiveClientCount(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getMyActiveClientCount(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getNutritionAssignmentPlanByClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const { client_id, range } = req.body;

            if (!token || !dietitian_id) {
                return res.status(401).json({ message: "Yetkisiz erişim." });
            }

            if (!client_id || !range) {
                return res.status(400).json({ message: "client_id ve range zorunludur." });
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
                    return res.status(400).json({ message: "Geçersiz range: 'day', 'week' veya 'month' olmalı." });
            }

            const plans = await DietitianService.getNutritionAssignmentPlanByClient(
                dietitian_id,
                client_id,
                startDate,
                endDate
            );

            return res.status(200).json(plans);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async getMyNotes(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await DietitianService.getMyNotes(dietitian_id);
            return res.status(200).json(result);
        } catch(error) {
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async addNote(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const { note } = req.body

            if(!note) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Note içeriği girilmedi."
                });
            }

            const result = await DietitianService.addNote(dietitian_id, note);

            return res.status(200).json(result);
        } catch(error) {
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async deleteNote(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const { note_id } = req.query;

            if (!note_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Silinecek notun ID'si belirtilmelidir."
                });
            }

            const note = await Notes.findByPk(note_id);

            if (!note) {
                return res.status(404).json({
                    success: false,
                    message: "Not bulunamadı."
                });
            }

            await note.destroy();

            return res.status(200).json({
                success: true,
                message: "Not başarıyla silindi."
            });
        } catch (error) {
            console.error("deleteNote error:", error);
            return res.status(500).json({
                success: false,
                message: "Bir hata oluştu.",
                error: error.message
            });
        }
    }


}

module.exports = DietitianController;
