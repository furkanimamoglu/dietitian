const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const DietitianSubPackage = sequelize.define('DietitianSubscription', {
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    subscription_type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isIn: {
                args: [["free", "student", "starter", "premium", "kurumsal"]],
                msg: 'Abonelik türü yalnızca "free", "student", "starter", "premium" veya "kurumsal" olabilir.'
            }
        }
    },
    client_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        validate: {
            isInt: {
                msg: 'Müşteri limiti tam sayı olmalıdır.'
            }
        }
    },
    appointment_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 20,
        validate: {
            isInt: {
                msg: 'Randevu limiti tam sayı olmalıdır.'
            }
        }
    },
    nutrition_plan_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Beslenme planı limiti tam sayı olmalıdır.'
            }
        }
    },
    exercise_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Egzersiz limiti tam sayı olmalıdır.'
            }
        }
    },
    recipe_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Tarif limiti tam sayı olmalıdır.'
            }
        }
    },
    sms_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
            isBoolean: {
                msg: 'SMS desteği (true/false) olmalıdır.'
            }
        }
    },
    special_support: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
            isBoolean: {
                msg: 'Özel destek hizmeti (true/false) olmalıdır.'
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: {
                msg: 'Fiyat ondalık sayı olmalıdır.'
            }
        }
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: {
            isInt: {
                msg: 'Süre gün sayısı tam sayı olmalıdır.'
            }
        }
    },
    features: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('features');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('features', JSON.stringify(value));
        }
    }
});

DietitianSubPackage.afterSync(async () => {
    try {
        const count = await DietitianSubPackage.count();

        if (count === 0) {
            await DietitianSubPackage.bulkCreate([
                {
                    subscription_type: "free",
                    client_limit: null,
                    appointment_limit: null,
                    nutrition_plan_limit: null,
                    exercise_limit: null,
                    recipe_limit: null,
                    price: 500.00,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "25 Danışan", "Sınırsız Randevu", "Sınırsız Beslenme Planı", "Sınırsız Egzersiz", "Sınırsız Tarif", "E-mail Desteği", "7/24 Destek"]
                },
                {
                    subscription_type: "starter",
                    client_limit: null,
                    appointment_limit: null,
                    nutrition_plan_limit: null,
                    exercise_limit: null,
                    recipe_limit: null,
                    price: 500.00,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "25 Danışan", "Sınırsız Randevu", "Sınırsız Beslenme Planı", "Sınırsız Egzersiz", "Sınırsız Tarif", "E-mail Desteği", "7/24 Destek"]
                },
                {
                    subscription_type: "student",
                    client_limit: null,
                    appointment_limit: null,
                    nutrition_plan_limit: null,
                    exercise_limit: null,
                    recipe_limit: null,
                    price: 500.00,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "Sınırsız Danışan", "Sınırsız Randevu", "Sınırsız Beslenme Planı", "Sınırsız Egzersiz", "Sınırsız Tarif", "SMS Desteği", "E-mail Desteği", "7/24 Destek"]
                },
                {
                    subscription_type: "premium",
                    client_limit: null,
                    appointment_limit: null,
                    nutrition_plan_limit: null,
                    exercise_limit: null,
                    recipe_limit: null,
                    price: 1000.00,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "Sınırsız Danışan", "Sınırsız Randevu", "Sınırsız Beslenme Planı", "Sınırsız Egzersiz", "Sınırsız Tarif", "SMS Desteği", "E-mail Desteği", "7/24 Destek"]
                }
            ]);
        }
    } catch (error) {
        console.error("Error creating default subscription packages:", error);
    }
});

module.exports = DietitianSubPackage;
