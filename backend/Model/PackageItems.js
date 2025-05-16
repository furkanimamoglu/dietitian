const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const PackageItems = sequelize.define('PackageItems', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
);

module.exports = PackageItems;