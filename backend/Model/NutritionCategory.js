const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const NutritionCategory = sequelize.define('NutritionCategory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'NutritionCategories',
    timestamps: false
});

module.exports = NutritionCategory;
