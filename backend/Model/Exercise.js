const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Exercise = sequelize.define('Exercise', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dietitians',
                key: 'id'
            }
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ExerciseCategories',
                key: 'id'
            }
        },
        exercise_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exercise_description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        video: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
        },
        equipment: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        calories_burned: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    },
    {
        timestamps: false,
        tableName: 'Exercises'
    }
);

module.exports = Exercise;