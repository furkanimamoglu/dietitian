const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Exercise = sequelize.define('Exercise', {
        id: {
            type: DataTypes.BIGINT,
            unique: true,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Dietitians',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'Diyetisyen ID alanı boş bırakılamaz.'
                },
                isInt: {
                    msg: 'Diyetisyen ID sayısal bir değer olmalıdır.'
                }
            }
        },
        category_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'ExerciseCategories',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'Kategori ID alanı boş bırakılamaz.'
                },
                isInt: {
                    msg: 'Kategori ID sayısal bir değer olmalıdır.'
                }
            }
        },
        exercise_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Egzersiz adı boş bırakılamaz.'
                },
                notEmpty: {
                    msg: 'Egzersiz adı boş olamaz.'
                },
                len: {
                    args: [2, 100],
                    msg: 'Egzersiz adı en az 2, en fazla 100 karakter olmalıdır.'
                }
            }
        },
        exercise_description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 500],
                    msg: 'Egzersiz açıklaması en fazla 500 karakter olabilir.'
                }
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        video: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                isInt: {
                    msg: 'Süre sayısal bir değer olmalıdır.'
                }
            }
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            validate: {
                isInt: {
                    msg: 'Zorluk derecesi sayısal bir değer olmalıdır.'
                },
                min: {
                    args: 1,
                    msg: 'Zorluk derecesi en az 1 olmalıdır.'
                },
                max: {
                    args: 5,
                    msg: 'Zorluk derecesi en fazla 5 olabilir.'
                }
            }
        },
        equipment: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Ekipman bilgisi en fazla 100 karakter olabilir.'
                }
            }
        },
        calories_burned: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    },
    {
        timestamps: false,
        tableName: 'Exercises'
    }
);

module.exports = Exercise;