const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Measurement = sequelize.define('Measurement', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        boy: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kilo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bel: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kalca: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gogus: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        yag: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kas: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        su: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);

module.exports = Measurement;