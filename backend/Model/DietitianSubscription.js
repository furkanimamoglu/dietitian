const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const DietitianSubscription = sequelize.define('DietitianSubscription', {
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
        allowNull: false,
        defaultValue: 5,
        validate: {
            isInt: {
                msg: 'Müşteri limiti tam sayı olmalıdır.'
            }
        }
    },
    appointment_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        validate: {
            isInt: {
                msg: 'Randevu limiti tam sayı olmalıdır.'
            }
        }
    },
    nutrition_plan_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Beslenme planı limiti tam sayı olmalıdır.'
            }
        }
    },
    exercise_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Egzersiz limiti tam sayı olmalıdır.'
            }
        }
    },
    recipe_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            isInt: {
                msg: 'Tarif limiti tam sayı olmalıdır.'
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

DietitianSubscription.afterSync(async () => {
    try {
        const count = await DietitianSubscription.count();
        
        if (count === 0) {
            await DietitianSubscription.bulkCreate([
                {
                    subscription_type: "free",
                    client_limit: 25,
                    appointment_limit: 10,
                    nutrition_plan_limit: 5,
                    exercise_limit: 5,
                    recipe_limit: 5,
                    price: 0.00,
                    duration_days: 30,
                    features: ["Temel Özellikler", "5 Danışan", "10 Randevu", "5 Beslenme Planı"]
                },
                {
                    subscription_type: "student",
                    client_limit: 100,
                    appointment_limit: 20,
                    nutrition_plan_limit: 10,
                    exercise_limit: 10,
                    recipe_limit: 10,
                    price: 99.99,
                    duration_days: 30,
                    features: ["Temel Özellikler", "10 Danışan", "20 Randevu", "10 Beslenme Planı", "Öğrenci İndirimi"]
                },
                {
                    subscription_type: "starter",
                    client_limit: 100,
                    appointment_limit: 50,
                    nutrition_plan_limit: 30,
                    exercise_limit: 30,
                    recipe_limit: 30,
                    price: 199.99,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "20 Danışan", "50 Randevu", "30 Beslenme Planı", "E-mail Desteği"]
                },
                {
                    subscription_type: "premium",
                    client_limit: 9999,
                    appointment_limit: 9999,
                    nutrition_plan_limit: 9999,
                    exercise_limit: 9999,
                    recipe_limit: 9999,
                    price: 1000.00,
                    duration_days: 30,
                    features: ["Tüm Özellikler", "Sınırsız Danışan", "Sınırsız Randevu", "Sınırsız Plan", "E-mail Desteği", "7/24 Destek"]
                },
                {
                    subscription_type: "kurumsal",
                    client_limit: 1000,
                    appointment_limit: 1000,
                    nutrition_plan_limit: 500,
                    exercise_limit: 500,
                    recipe_limit: 500,
                    price: 999.99,
                    duration_days: 30,
                    features: ["Tüm Premium Özellikler", "Çoklu Diyetisyen Desteği", "Özel Raporlama", "Öncelikli Destek"]
                }
            ]);
        }
    } catch (error) {
        console.error("Error creating default subscription packages:", error);
    }
});

module.exports = DietitianSubscription;
