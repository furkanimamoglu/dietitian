const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const RecipeCategory = sequelize.define('RecipeCategory', {
    id: {
        type: DataTypes.BIGINT,
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
                args: [2, 50],
                msg: 'Kategori adı 2-50 karakter arasında olmalıdır'
            }
        }
    },
}, {
    tableName: 'RecipeCategories',
    timestamps: false
});

module.exports = RecipeCategory;
