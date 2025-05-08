// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Dietitian = sequelize.define('Dietitian', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Bu e-posta zaten kullanılıyor.'
            },
            validate: {
                isEmail: {
                    msg: 'E-posta adresi geçerli olmalıdır.'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [4, 21],
                    msg: 'Şifre 4 ile 21 karakter arasında olmak zorundadır.'
                }
            }
        },
        name: {
            type: DataTypes.STRING
        },
        token: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "DIETITIAN"
        },
        phoneNumber: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "true",
        },
        language: DataTypes.STRING,
        currency: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        gender: DataTypes.STRING,
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                msg: 'Bu token zaten mevcut.'
            },
        }
    }
);

module.exports = Dietitian;