// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Exercise = sequelize.define('Exercise', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: DataTypes.INTEGER,
        exercise_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exercise_description: {
            type: DataTypes.STRING
        },
        exercise_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exercise_link: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exercise_isFile: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        timestamps: false,
    }
);

module.exports = Exercise;