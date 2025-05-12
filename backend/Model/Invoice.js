// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Invoice = sequelize.define('Invoice', {
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
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('paid', 'unpaid', 'cancelled'),
            allowNull: false,
            defaultValue: 'unpaid'
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }
);

module.exports = Invoice;