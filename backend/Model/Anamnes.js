// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Anamnes = sequelize.define('Anamnes', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        client_id: DataTypes.INTEGER,
        answer: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

module.exports = Anamnes;