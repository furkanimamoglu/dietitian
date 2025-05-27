const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const ExerciseCategory = sequelize.define('ExerciseCategory', {
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
                msg: 'Kategori adı boş bırakılamaz.'
            },
            notEmpty: {
                msg: 'Kategori adı boş olamaz.'
            },
            len: {
                args: [2, 50],
                msg: 'Kategori adı en az 2, en fazla 50 karakter olmalıdır.'
            }
        }
    },
}, {
    tableName: 'ExerciseCategories',
    timestamps: false
});

module.exports = ExerciseCategory;
