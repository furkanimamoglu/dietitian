const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.BIGINT,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.BIGINT,
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
        fcmToken: {
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
            type: DataTypes.ENUM('Aktif', 'Pasif'),
            allowNull: false,
            defaultValue: 'Aktif',
            validate: {
                isIn: {
                    args: [['Aktif', 'Pasif']],
                    msg: "Durum 'Aktif', 'Pasif' olmalıdır."
                }
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        dietitianNotes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profilePhoto: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'placeholder_client.jpg'
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
        },
        kullaniciSozlesmesiApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: {
                    msg: 'Kullanıcı onayı alanı boş bırakılamaz.'
                }
            }
        },
        SMSApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: {
                    msg: 'SMS onayı alanı boş bırakılamaz.'
                }
            }
        },
        MailApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: {
                    msg: 'Mail onayı alanı boş bırakılamaz.'
                }
            }
        },
        NotificationApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: {
                    msg: 'Bildirim onayı alanı boş bırakılamaz.'
                }
            }
        },
        dailyWaterIntake: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 2500
        },
    }
);


module.exports = Client;