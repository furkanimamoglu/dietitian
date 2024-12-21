// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const DietitianOption = sequelize.define('DietitianOption', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        isUsingAgenda: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isRemote: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        timestamps: false,
    }
);

module.exports = DietitianOption;