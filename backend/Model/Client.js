// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Appointment = require('./Appointment');
const Anamnesis = require('./Anamnes');
const Invoice = require('./Invoice');

const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [2, 50],
                    msg: 'İsim en az 2, en fazla 50 karakter olmalıdır.'
                }
            }
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [2, 50],
                    msg: 'Soyisim en az 2, en fazla 50 karakter olmalıdır.'
                }
            }
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
        phoneNumber: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "aktif",
        },
        language: DataTypes.STRING,
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Erkek", "Kadın"]],
                    msg: 'Cinsiyet yalnızca "Erkek" veya "Kadın" olabilir.'
                }
            }
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: 50,
                    msg: 'Boy 50 cmden küçük olamaz.'
                },
                max: {
                    args: 300,
                    msg: 'Boy 300 cmden büyük olamaz.'
                }
            }
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: 10,
                    msg: 'Kilo 10 kg\'dan küçük olamaz.'
                },
                max: {
                    args: 500,
                    msg: 'Kilo 500 kg\'dan büyük olamaz.'
                }
            }
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }
);


module.exports = Client;