const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

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
        phoneNumber: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: {
                msg: 'Bu telefon numarası zaten kullanılıyor.'
            },
            validate: {
                min: 5000000000,
                max: 5999999999
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
        token: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "CLIENT"
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [2, 80],
                    msg: 'İsim Soyisim en az 2, en fazla 80 karakter olmalıdır.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                msg: 'Bu mail adresi zaten kullanılıyor.'
            },
            validate: {
                isEmail: {
                    msg: 'E-posta adresi geçerli olmalıdır.'
                }
            }
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        language: {
            type: DataTypes.STRING,
            defaultValue: "TR",
        },
        gender: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [["Erkek", "Kadın", "Diğer"]],
                    msg: 'Cinsiyet yalnızca "Erkek", "Kadın" veya "Diğer" olabilir.'
                }
            }
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: 50,
                    msg: 'Boy 50 cm\'den küçük olamaz.'
                },
                max: {
                    args: 300,
                    msg: 'Boy 300 cm\'den büyük olamaz.'
                }
            }
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: 1,
                    msg: 'Kilo 1 kg\'dan küçük olamaz.'
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
        },
        kvkkApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }
);


module.exports = Client;