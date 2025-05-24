const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Recipe = sequelize.define('Recipe', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
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
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 500],
                    msg: 'Açıklama en fazla 500 karakter olabilir'
                }
            }
        },
        category_id: {
            type: DataTypes.INTEGER,
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
        hasVideo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        video: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "http://google.com",
            validate: {
                isUrl: {
                    msg: 'Geçerli bir video URL\'si girilmelidir'
                }
            }
        },
        hazirlanis: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Hazırlanış bilgisi gereklidir'
                },
                notEmpty: {
                    msg: 'Hazırlanış bilgisi boş olamaz'
                },
                len: {
                    args: [10, 2000],
                    msg: 'Hazırlanış bilgisi 10-2000 karakter arasında olmalıdır'
                }
            }
        },
        malzemeler: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Malzeme listesi gereklidir'
                },
                notEmpty: {
                    msg: 'Malzeme listesi boş olamaz'
                },
                len: {
                    args: [5, 1000],
                    msg: 'Malzeme listesi 5-1000 karakter arasında olmalıdır'
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
    }
);

module.exports = Recipe;