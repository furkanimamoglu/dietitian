// Libraries
const {DataTypes} = require('sequelize');
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
            type: DataTypes.STRING,
            allowNull: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'RecipeCategories',
                key: 'id'
            }
        },
        hasVideo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        video: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "http://google.com"
        },
        hazirlanis: {
            type: DataTypes.STRING,
            allowNull: false
        },
        malzemeler: {
            type: DataTypes.STRING,
            allowNull: false
        },
        kcal: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        protein: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        karbonhidrat: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        yag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    },
    {
        timestamps: false,
    }
);

module.exports = Recipe;