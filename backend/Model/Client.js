// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Anamnesis = require('./Anamnes');
const Invoice = require('./Invoice');

const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'This username is already taken.'
            },
            validate: {
                len: {
                    args: [4, 21],
                    msg: 'Your username may be 4 to 21 characters only.'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [4, 21],
                    msg: 'Your password may be 4 to 21 characters only.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'This email is already taken.'
            },
            validate: {
                isEmail: {
                    msg: 'Email address must be valid.'
                }
            }
        },
        phoneNumber: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "true",
        },
        language: DataTypes.STRING,
        gender: DataTypes.STRING,
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }
);

module.exports = Client;