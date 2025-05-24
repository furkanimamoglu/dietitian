const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const NutritionAssignment = sequelize.define('NutritionAssignment', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Clients',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Danışan ID gereklidir'
            },
            isInt: {
                msg: 'Danışan ID geçerli bir sayı olmalıdır'
            }
        }
    },
    nutrition_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'NutritionPlans',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Beslenme planı ID gereklidir'
            },
            isInt: {
                msg: 'Beslenme planı ID geçerli bir sayı olmalıdır'
            }
        }
    },
    mealPlan: {
        type: DataTypes.JSON,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 5000],
                msg: 'Not en fazla 5000 karakter olabilir'
            }
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Başlangıç tarihi gereklidir'
            },
            isDate: {
                msg: 'Geçerli bir başlangıç tarihi giriniz'
            }
        }
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Bitiş tarihi gereklidir'
            },
            isDate: {
                msg: 'Geçerli bir bitiş tarihi giriniz'
            }
        }
    }
}, {
    tableName: 'NutritionAssignments',
    timestamps: true
});

module.exports = NutritionAssignment;
