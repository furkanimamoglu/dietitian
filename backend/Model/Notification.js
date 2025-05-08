// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        phoneNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

module.exports = Notification;