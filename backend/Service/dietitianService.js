// Libraries
const {Op} = require("sequelize");
const config = require('../config.json');
const jwt = require('jsonwebtoken');

// Imports
const Exception = require('../Exception/Exception');

// Enums
const {DIETITIAN} = require("../Enum/Role");

// Models
const Dietitian = require('../Model/Dietitian');
const Client = require('../Model/Client');

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
                throw new Exception('Invalid credentials.', 400, true);
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
        if (!email || !password) {
            throw new Exception('All fields must be filled.', 400, true);
        }

        try {
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
                throw new Exception('Dietitian not found.', 400, true);
            }

            await dietitian.destroy();
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async registerClient(email, password, phoneNumber) {
        if (!email || !password || !phoneNumber) {
            throw new Exception('All fields must be filled.', 400, true);
        }

        try {
            const token = jwt.sign(
                {email: email, role: DIETITIAN},
                config.secretkey
            );

            return await Client.create({
                dietitian_id: 1,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                role: DIETITIAN,
                token: token
            });
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async deleteClient(clientUsername) {
        try {
            const deletedRows = await Client.destroy({
                where: {
                    username: clientUsername
                }
            });

            if (deletedRows === 0) {
                throw new Exception('Client not found.', 400, true);
            }

            return {
                message: 'Client deleted successfully.'
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getMyAllClients(dietitianId) {
        try {
            const dietitian = await Dietitian.findOne({
                where: {id: dietitianId},
                include: [{
                    model: Client,
                    as: 'Clients',
                }]
            });

            if (!dietitian) {
                throw new Error('Dietitian not found');
            }

            return dietitian.Clients;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

}

module.exports = new DietitianService();