const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const NutritionCategory = sequelize.define('NutritionCategory', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Kategori adı gereklidir'
            },
            notEmpty: {
                msg: 'Kategori adı boş olamaz'
            },
            len: {
                args: [2, 100],
                msg: 'Kategori adı 2-100 karakter arasında olmalıdır'
            }
        }
    }
}, {
    tableName: 'NutritionCategories',
    timestamps: false
});

module.exports = NutritionCategory;