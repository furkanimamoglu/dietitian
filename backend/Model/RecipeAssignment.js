const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const RecipeAssignment = sequelize.define('RecipeAssignment', {
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
    recipe_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Recipes',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Tarif ID alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Tarif ID sayısal bir değer olmalıdır.'
            }
        }
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 500],
                msg: 'Not alanı en fazla 500 karakter olabilir.'
            }
        }
    },
}, {
    tableName: 'RecipeAssignments',
    timestamps: true
});

module.exports = RecipeAssignment;
