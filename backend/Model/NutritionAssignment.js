const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const NutritionAssignment = sequelize.define('NutritionAssignment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Clients',
            key: 'id'
        }
    },
    nutrition_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'NutritionPlans',
            key: 'id'
        }
    },
    mealPlan: {
        type: DataTypes.JSON,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'NutritionAssignments',
    timestamps: true
});

module.exports = NutritionAssignment;
