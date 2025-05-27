const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Diyetisyen ID alanı boş bırakılamaz.'
                }
            }
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
                min: {
                    args: 5000000000,
                    msg: 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX formatında).'
                },
                max: {
                    args: 5999999999,
                    msg: 'Geçerli bir telefon numarası giriniz (5XXXXXXXXX formatında).'
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
        token: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "CLIENT",
            validate: {
                notNull: {
                    msg: 'Rol alanı boş bırakılamaz.'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'İsim alanı boş bırakılamaz.'
                },
                len: {
                    args: [2, 50],
                    msg: 'İsim Soyisim en az 2, en fazla 50 karakter olmalıdır.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                msg: 'Bu mail adresi zaten kullanılıyor.'
            }
        },
        status: {
            type: DataTypes.ENUM('aktif', 'inaktif'),
            allowNull: false,
            defaultValue: 'aktif',
            validate: {
                isIn: {
                    args: [['aktif', 'inaktif']],
                    msg: "Durum 'aktif', 'inaktif' olmalıdır."
                }
            }
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
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
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
    }
);


module.exports = Client;