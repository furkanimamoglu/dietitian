// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Appointment = sequelize.define('Appointment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        note: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending"
        },
        canceledBy: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        }
    },
    {
        timestamps: false,
    }
);

module.exports = Appointment;