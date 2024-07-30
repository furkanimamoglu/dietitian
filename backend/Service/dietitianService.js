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

const DietitianService = {
    // Authentication
    login: async (username, password) => {
        try {
            const dietitianInfo = await Dietitian.findOne(
                {
                    where: {
                        username: username,
                        password: password
                    }
                }
            );

            let token = jwt.sign({username: dietitianInfo.username, role: dietitianInfo.role}, config.secretkey, {expiresIn: '24h'});

            return {...dietitianInfo.dataValues, token: token}
        } catch (error) {
            throw new Exception(error.message,400)
        }

    },

    register: async (username, password, email, ipAddress) => {

        if(username === undefined || password === undefined || email === undefined)
        {
            throw new Exception('Tüm alanlar doldurulmalıdır.', 400, true)
        }
        else {
            try {
                let token = jwt.sign({username: username, role: DIETITIAN}, config.secretkey);
                return await Dietitian.create({
                    username: username,
                    password: password,
                    email: email,
                    role: DIETITIAN,
                    ipAddress: ipAddress,
                    token: token
                });
            } catch (error) {
                throw new Exception(error.message,400)
            }
        }
    },

    delete: async (id) =>{
        try {
            await Dietitian.findByPk(id)
                .then(dietitian =>
                    {
                        if (dietitian == null)
                        {
                            throw new Exception('Kullanıcı bulunamadı.',400,true)
                        }
                        else
                        {
                            dietitian.destroy(
                                {
                                    where: {
                                        id: id
                                    }
                                });
                        }
                    }
                )
        } catch (error) {
            throw new Exception(error.message,400)
        }
    },

    // Dietitian Functionalities
    registerClient: async (username, password, email, phoneNumber) => {
        try {
            if(username === undefined || password === undefined || email === undefined || phoneNumber === undefined) {
                throw new Exception('Tüm alanlar doldurulmalıdır.', 400, true);
            }
            let token = jwt.sign({username: username, role: DIETITIAN}, config.secretkey);
            return await Client.create({
                username: username,
                password: password,
                email: email,
                role: DIETITIAN,
                token: token
            });
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    },

    deleteClient: async (clientUsername) => {
        try {
            return await Client.destroy({
                where: {
                    username: clientUsername
                }
            })
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

}

module.exports = DietitianService;