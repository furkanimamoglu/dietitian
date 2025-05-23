const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const RecipeCategory = sequelize.define('RecipeCategory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'RecipeCategories',
    timestamps: false
});

module.exports = RecipeCategory;
