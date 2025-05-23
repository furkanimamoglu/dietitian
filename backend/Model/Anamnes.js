const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Anamnes = sequelize.define('Anamnes', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
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
        saglik_bilgileri: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        },
        diyet_aliskanliklari: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        },
        fiziksel_aktivite: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        },
        ozel_notlar: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        }
    }
);

module.exports = Anamnes;