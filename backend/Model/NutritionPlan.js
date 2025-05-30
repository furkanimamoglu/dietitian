const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const NutritionPlan = sequelize.define('NutritionPlan', {
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'NutritionCategories',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Kategori ID gereklidir'
            },
            isInt: {
                msg: 'Kategori ID geçerli bir sayı olmalıdır'
            }
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Beslenme planı başlığı gereklidir'
            },
            notEmpty: {
                msg: 'Beslenme planı başlığı boş olamaz'
            },
            len: {
                args: [3, 100],
                msg: 'Başlık 3-100 karakter arasında olmalıdır'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 2000],
                msg: 'Açıklama en fazla 2000 karakter olabilir'
            }
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/placeholder.png'
    },
    mealPlan: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = NutritionPlan;
