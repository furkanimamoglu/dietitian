const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Dietitian = sequelize.define('Dietitian', {
    id: {
        type: DataTypes.BIGINT,
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
    subscription_type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "free"
    },
    subscription_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
            isDate: {
                msg: 'Abonelik başlangıç tarihi geçerli bir tarih olmalıdır.'
            }
        }
    },
    subscription_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
            isDate: {
                msg: 'Abonelik bitiş tarihi geçerli bir tarih olmalıdır.'
            }
        }
    },
    verificationCode: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    verificationCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true
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
        defaultValue: false,
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

Dietitian.addHook('beforeSave', (dietitian) => {
    if (dietitian.subscription_end_date && new Date() > dietitian.subscription_end_date) {
        dietitian.subscription_type = "free";
    }
});

module.exports = Dietitian;