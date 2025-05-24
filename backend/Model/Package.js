const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Package = sequelize.define('Packages', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Diyetisyen ID gereklidir'
                },
                isInt: {
                    msg: 'Diyetisyen ID geçerli bir sayı olmalıdır'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Paket adı gereklidir'
                },
                notEmpty: {
                    msg: 'Paket adı boş olamaz'
                },
                len: {
                    args: [3, 100],
                    msg: 'Paket adı 3-100 karakter arasında olmalıdır'
                }
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 500],
                    msg: 'Açıklama en fazla 500 karakter olabilir'
                }
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Fiyat gereklidir'
                },
                notEmpty: {
                    msg: 'Fiyat boş olamaz'
                },
                isNumeric: {
                    msg: 'Fiyat sayısal bir değer olmalıdır'
                }
            }
        }
    },
    {
        timestamps: false
    }
);

module.exports = Package;