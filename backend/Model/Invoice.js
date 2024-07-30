// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Invoice = sequelize.define('Invoice', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

module.exports = Invoice;