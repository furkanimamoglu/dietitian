const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const ExerciseAssignment = sequelize.define('ExerciseAssignment', {
    id: {
        type: DataTypes.BIGINT,
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
                msg: 'Danışan ID alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Danışan ID sayısal bir değer olmalıdır.'
            }
        }
    },
    exercise_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Exercises',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Egzersiz ID alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Egzersiz ID sayısal bir değer olmalıdır.'
            }
        }
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Not en fazla 1000 karakter olabilir.'
            }
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Başlangıç tarihi boş bırakılamaz.'
            },
            isDate: {
                msg: 'Başlangıç tarihi geçerli bir tarih olmalıdır.'
            }
        }
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Bitiş tarihi boş bırakılamaz.'
            },
            isDate: {
                msg: 'Bitiş tarihi geçerli bir tarih olmalıdır.'
            }
        }
    }
}, {
    tableName: 'ExerciseAssignments',
    timestamps: true
});

module.exports = ExerciseAssignment;
