const {Client} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const {CLIENT} = require("../Enum/Role");

class ClientService {
    async login(email, password) {
        try {
            const clientInfo = await Client.findOne({
                where: {
                    email: email,
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

    async register(email, password, ipAddress) {
        try {
            if (!email || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const client = await Client.create({
                email: email,
                password: password,
                role: CLIENT,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    id: client.id,
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
}

module.exports = new ClientService();