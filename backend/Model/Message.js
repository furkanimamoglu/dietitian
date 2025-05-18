// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        client_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        timestamps: true
    }
);

module.exports = Message;