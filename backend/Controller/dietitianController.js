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
            const {name, surname, email, password, phoneNumber, height, weight, gender} = req.body;

            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            if (!email || !password || !phoneNumber) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.registerClient(user_id, name, surname, email, password, phoneNumber, height, weight, gender);

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
            const { id, name, surname, email, phoneNumber, height, weight, gender, status } = req.body;

            if (!id || !name || !surname || !email || !phoneNumber || !height || !weight || !gender || !status) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm parametreler doldurulmalıdır."
                });
            }

            const result = await DietitianService.updateClient(user_id, id, {
                name,
                surname,
                email,
                phoneNumber,
                height,
                weight,
                gender,
                status
            });

            res.status(200).json(result)
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || false,
                message: err.message || "Bir hata oluştu.",
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

    async getAllMyNutritionCategories(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getAllMyNutritionCategories(user_id)
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    async addNutritionCategories(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const categoryData = req.body;

            if (!categoryData || !categoryData.title) {
                return res.status(400).json({
                    message: "Kategori başlığı gereklidir."
                });
            }

            const result = await DietitianService.addNutritionCategory(user_id, categoryData);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
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


}

module.exports = new DietitianController();
