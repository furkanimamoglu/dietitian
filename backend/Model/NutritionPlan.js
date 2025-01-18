// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');
const NutritionCategory = require('./NutritionCategory');

const NutritionPlan = sequelize.define('NutritionPlan', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dietitian_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
});

module.exports = NutritionPlan;