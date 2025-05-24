const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const PackageItems = sequelize.define('PackageItems', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Paket ID gereklidir'
                },
                isInt: {
                    msg: 'Paket ID geçerli bir tamsayı olmalıdır'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Öğe adı gereklidir'
                },
                notEmpty: {
                    msg: 'Öğe adı boş olamaz'
                },
                len: {
                    args: [2, 100],
                    msg: 'Öğe adı 2-100 karakter arasında olmalıdır'
                }
            }
        }
    },
    {
        timestamps: false
    }
);

module.exports = PackageItems;