const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Recipe = sequelize.define('Recipe', {
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
                    msg: 'Diyetisyen ID gereklidir'
                },
                isInt: {
                    msg: 'Diyetisyen ID geçerli bir tamsayı olmalıdır'
                }
            }
        },
        category_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'RecipeCategories',
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'Kategori ID gereklidir'
                },
                isInt: {
                    msg: 'Kategori ID geçerli bir tamsayı olmalıdır'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Tarif adı gereklidir'
                },
                notEmpty: {
                    msg: 'Tarif adı boş olamaz'
                },
                len: {
                    args: [3, 100],
                    msg: 'Tarif adı 3-100 karakter arasında olmalıdır'
                }
            }
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 5000],
                    msg: 'Açıklama en fazla 5000 karakter olabilir'
                }
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        hazirlanis: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Hazırlanış bilgisi gereklidir'
                },
                notEmpty: {
                    msg: 'Hazırlanış bilgisi boş olamaz'
                },
                len: {
                    args: [1, 5000],
                    msg: 'Hazırlanış bilgisi 1-5000 karakter arasında olmalıdır'
                }
            }
        },
        malzemeler: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Malzeme listesi gereklidir'
                },
                notEmpty: {
                    msg: 'Malzeme listesi boş olamaz'
                },
                len: {
                    args: [1, 5000],
                    msg: 'Malzeme listesi 1-1000 karakter arasında olmalıdır'
                }
            }
        },
        kcal: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                isInt: {
                    msg: 'Kalori değeri tamsayı olmalıdır'
                }
            }
        },
        protein: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                isInt: {
                    msg: 'Protein değeri tamsayı olmalıdır'
                }
            }
        },
        karbonhidrat: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                isInt: {
                    msg: 'Karbonhidrat değeri tamsayı olmalıdır'
                }
            }
        },
        yag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                isInt: {
                    msg: 'Yağ değeri tamsayı olmalıdır'
                }
            }
        }
    },
    {
        timestamps: false,
        tableName: 'Recipes'
    }
);

module.exports = Recipe;