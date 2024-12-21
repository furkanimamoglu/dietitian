// Libraries
const { DataTypes } = require('sequelize');
const sequelize = require('../Utils/Database');

const Anamnes = require('./Anamnes');

const AnamnesQuestion = sequelize.define('AnamnesQuestion', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        client_id: DataTypes.INTEGER,
        question: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
);

AnamnesQuestion.hasMany(Anamnes,{
    foreignKey: "anamnes_question_id"
});

module.exports = AnamnesQuestion;