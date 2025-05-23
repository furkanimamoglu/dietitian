const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));


const Dietitian = sequelize.define('Dietitian', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        phoneNumber: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: {
                msg: 'Bu telefon numarası zaten kullanılıyor.'
            },
            validate: {
                isNumeric: {
                    msg: 'Telefon numarası yalnızca rakamlardan oluşmalıdır.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "İsimsiz Danışan"
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "DIETITIAN"
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        language: DataTypes.STRING,
        currency: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        },
        kvkkApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }
);

module.exports = Dietitian;