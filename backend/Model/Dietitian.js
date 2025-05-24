const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));


const Dietitian = sequelize.define('Dietitian', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
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
            notNull: {
                msg: 'Telefon numarası alanı boş bırakılamaz.'
            },
            isNumeric: {
                msg: 'Telefon numarası yalnızca rakamlardan oluşmalıdır.'
            },
            min: {
                args: 5000000000,
                msg: 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX).'
            },
            max: {
                args: 5999999999,
                msg: 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX).'
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
            notNull: {
                msg: 'Şifre alanı boş bırakılamaz.'
            },
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
        defaultValue: "DIETITIAN",
        validate: {
            isIn: {
                args: [["DIETITIAN"]],
                msg: 'Rol yalnızca "DIETITIAN" olabilir.'
            }
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    currency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            notNull: {
                msg: 'Para birimi alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Para birimi sayısal bir değer olmalıdır.'
            },
        }
    },
    gender: {
        type: DataTypes.STRING
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIP: {
                msg: 'Geçerli bir IP adresi giriniz.'
            }
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: {
            msg: 'Bu token zaten mevcut.'
        }
    },
    kvkkApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
            notNull: {
                msg: 'KVKK onayı alanı boş bırakılamaz.'
            }
        }
    }

});

module.exports = Dietitian;