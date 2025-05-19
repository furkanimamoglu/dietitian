const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const ExerciseCategory = sequelize.define('ExerciseCategory', {
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
    tableName: 'ExerciseCategories',
    timestamps: false
});

module.exports = ExerciseCategory;
