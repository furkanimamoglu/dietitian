const {Client, Dietitian} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const {CLIENT} = require("../Enum/Role");

class ClientService {
    async login(phoneNumber, password) {
        try {
            const clientInfo = await Client.findOne({
                where: {
                    phoneNumber: phoneNumber,
                    password: password
                }
            });

            if (!clientInfo) {
                throw new Exception('Hatalı giriş bilgileri.', 400, true);
            }

            const token = jwt.sign(
                {
                    id: clientInfo.id,
                    role: clientInfo.role
                },
                config.secretkey,
                { expiresIn: '24h' }
            );

            await clientInfo.update({ token });

            return {
                ...clientInfo.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async register(dietitian_id, name, phoneNumber, password, ipAddress) {
        try {
            if (!dietitian_id) {
                throw new Exception('Diyetisyen bulunamadı.', 400, true);
            }

            if (!phoneNumber || !name || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const client = await Client.create({
                dietitian_id: dietitian_id,
                name: name,
                phoneNumber: phoneNumber,
                password: password,
                role: CLIENT,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    client_id: client.id,
                    dietitian_id: client.dietitian_id,
                    role: CLIENT
                },
                config.secretkey
            );

            await client.update({ token });

            return {
                ...client.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getClientInfo(user_id) {
        try {
            if (!user_id) {
                throw new Error("Yetkisiz Erişim.");
            }

            const client = await Client.findOne({
                where: { id: user_id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            });

            if (!client) {
                throw new Error("Diyetisyen bulunamadı.");
            }

            return client;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }
}

module.exports = new ClientService();