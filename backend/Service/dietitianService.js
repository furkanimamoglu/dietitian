// Libraries
const config = require('../config.json');
const jwt = require('jsonwebtoken');

// Imports
const Exception = require('../Exception/Exception');

// Enums
const {DIETITIAN, CLIENT} = require("../Enum/Role");

// Models
const {Dietitian, Client, NutritionPlan, NutritionCategory} = require('../Model/MainModel');

class DietitianService {

    async login(email, password) {
        try {
            const dietitianInfo = await Dietitian.findOne({
                where: {
                    email: email,
                    password: password
                }
            });

            if (!dietitianInfo) {
                throw new Exception('Hatalı giriş bilgileri.', 400, true);
            }

            const token = jwt.sign(
                {id: dietitianInfo.id, email: dietitianInfo.email, role: dietitianInfo.role},
                config.secretkey,
                {expiresIn: '24h'}
            );

            return {...dietitianInfo.dataValues, token: token};
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async register(email, password, ipAddress) {
        try {
            if (!email || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const dietitian = await Dietitian.create({
                email: email,
                password: password,
                role: DIETITIAN,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {id: dietitian.id, email: dietitian.email, role: DIETITIAN},
                config.secretkey
            );

            return {
                email: dietitian.email,
                role: dietitian.role,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async delete(id) {
        try {
            const dietitian = await Dietitian.findByPk(id);

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 400, true);
            }

            await dietitian.destroy();
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async registerClient(user_id, name, surname, email, password, phoneNumber, height, weight, gender) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            if (!email || !password || !phoneNumber || !height || !weight || !gender) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const token = jwt.sign(
                {
                    email: email,
                    role: CLIENT
                },
                config.secretkey
            );

            return await Client.create({
                dietitian_id: user_id,
                name: name,
                surname: surname,
                gender: gender,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                height: height,
                weight: weight,
                role: CLIENT,
                token: token
            })
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async deleteClient(user_id, client_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const deletedRows = await Client.destroy({
                where: {
                    id: client_id,
                    dietitian_id: user_id
                }
            });

            if (deletedRows === 0) {
                throw new Exception('Danışan bulunamadı.', 400, true);
            }

            return {
                message: 'ID:' + client_id + ' danışanınız başarıyla silindi.'
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async updateClient(user_id, client_id, updateData) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz erişim.", 401);
            }

            const client = await Client.findOne({
                where: {
                    id: client_id,
                    dietitian_id: user_id,
                },
            });

            if (!client) {
                throw new Exception("Danışan bulunamadı.", 404, true);
            }

            await client.update(updateData);

            return client;
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || false);
        }
    }

    async getMyClient(user_id, client_id) {
        try {

            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: {
                    id: user_id
                },
                include: [
                    {
                        model: Client,
                        as: 'Clients',
                        where: {
                            id: client_id
                        }
                    }
                ]
            });

            if (!dietitian) {
                throw new Error('Diyetisyen bulunamadı veya bu Client size bağlı değil.');
            }

            if (!dietitian.Clients || dietitian.Clients.length === 0) {
                throw new Error('Hedef Client bulunamadı.');
            }

            return dietitian.Clients[0];
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }


    async getMyAllClients(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: {
                    id: user_id
                },
                include: [
                    {
                        model: Client,
                        as: 'Clients',
                    }
                ]
            });

            if (!dietitian) {
                throw new Error('Diyetisyen bulunamadı.');
            }

            return dietitian.Clients;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getAllMyNutritionCategories(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
                include: [
                    {
                        model: NutritionCategory,
                        as: 'categories',
                    },
                ],
            });

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 404);
            }

            return dietitian.categories;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }


    async addNutritionCategory(user_id, categoryData) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
            });

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 404);
            }

            return await NutritionCategory.create({
                ...categoryData,
                dietitian_id: user_id,
            });
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async addNutritionPlan(user_id, planData) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
            });

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 404);
            }

            return await NutritionPlan.create({
                ...planData,
                dietitian_id: user_id,
            });
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

}

module.exports = new DietitianService();