// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const NutritionCategory = sequelize.define('NutritionCategory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dietitian_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = NutritionCategory;
