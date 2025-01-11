// Libraries
const {Op} = require("sequelize");
const config = require('../config.json');
const jwt = require('jsonwebtoken');

// Imports
const Exception = require('../Exception/Exception');

// Enums
const {DIETITIAN, CLIENT} = require("../Enum/Role");

// Models
const Dietitian = require('../Model/Dietitian');
const Client = require('../Model/Client');
const Security = require("../Utils/Security");

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
                {email: dietitianInfo.email, role: dietitianInfo.role},
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

    async registerClient(user_id, email, password, phoneNumber) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            if (!email || !password || !phoneNumber) {
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
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                role: CLIENT,
                token: token
            })
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async deleteClient(token, client_id) {
        try {
            const user_id = Security.getUserIdFromToken(token);

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

    async getMyAllClients(token) {
        try {
            const user_id = Security.getUserIdFromToken(token);

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
}

module.exports = new DietitianService();