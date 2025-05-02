const {Client} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");
const jwt = require("jsonwebtoken");
const config = require("../config.json");

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
                {id: clientInfo.id, email: clientInfo.email, role: clientInfo.role},
                config.secretkey,
                {expiresIn: '24h'}
            );

            return {...clientInfo.dataValues, token: token};
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }
}

module.exports = new ClientService();