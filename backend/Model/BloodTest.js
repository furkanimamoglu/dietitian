// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const BloodTest = sequelize.define('BloodTest', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);

BloodTest.belongsTo(Client, { foreignKey: 'client_id' });
module.exports = BloodTest;