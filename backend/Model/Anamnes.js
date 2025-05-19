// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Anamnes = sequelize.define('Anamnes', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
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
        kan_tahlili: {
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
        uyku_stres_yonetimi: {
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