const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

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
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Danışan ID alanı boş bırakılamaz.'
                },
                isInt: {
                    msg: 'Danışan ID sayısal bir değer olmalıdır.'
                }
            }
        }
    }
);

module.exports = BloodTest;