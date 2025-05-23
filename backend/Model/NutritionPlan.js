const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const NutritionPlan = sequelize.define('NutritionPlan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/placeholder.png'
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'NutritionCategories',
            key: 'id'
        }
    },
    mealPlan: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = NutritionPlan;
