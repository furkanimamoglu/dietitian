// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Recipe = sequelize.define('Recipe', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
    },
    {
        timestamps: false,
    }
);

module.exports = Recipe;