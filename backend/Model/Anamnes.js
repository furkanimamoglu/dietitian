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
        client_id: DataTypes.INTEGER,
        kronik_hastaliklar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        alerjiler: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ilac_kullanimi: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ameliyatlar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        aile_saglik_gecmisi: {
            type: DataTypes.STRING,
            allowNull: true
        },
        kan_degerleri: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gunluk_su_tuketimi: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ogun_duzeni: {
            type: DataTypes.STRING,
            allowNull: true
        },
        favori_yiyecekler: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }
);

module.exports = Anamnes;