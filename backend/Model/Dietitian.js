// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Client = require('./Client');
const Exercise = require('./Exercise');
const Recipe = require('./Recipe');
const Appointment = require('./Appointment');
const AnamnesQuestion = require('./AnamnesQuestion');
const DietitianOption = require('./DietitianOption');

const Dietitian = sequelize.define('Dietitian', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
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
        role: DataTypes.STRING,
        phoneNumber: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "true",
        },
        language: DataTypes.STRING,
        currency: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        gender: DataTypes.STRING,
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                msg: 'This token is already produced.'
            },
        }
    }
);

Dietitian.hasMany(Client, {
    foreignKey: "dietitian_id"
});

Dietitian.hasMany(Exercise, {
    foreignKey: "dietitian_id"
});

Dietitian.hasMany(Recipe, {
    foreignKey: "dietitian_id"
});

Dietitian.hasMany(Appointment, {
    foreignKey: "dietitian_id"
});

Dietitian.hasMany(AnamnesQuestion, {
    foreignKey: "dietitian_id"
});

Dietitian.hasOne(DietitianOption, {
    foreignKey: "dietitian_id"
});

module.exports = Dietitian;