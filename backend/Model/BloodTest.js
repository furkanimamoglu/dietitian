const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const BloodTest = sequelize.define('BloodTest', {
        id: {
            type: DataTypes.BIGINT,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        client_id: {
            type: DataTypes.BIGINT,
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