const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Anamnes = sequelize.define('Anamnes', {
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
        validate: {
            notNull: {
                msg: 'Danışan ID alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Danışan ID sayısal bir değer olmalıdır.'
            }
        }
    },
    saglik_bilgileri: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    diyet_aliskanliklari: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    fiziksel_aktivite: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    ozel_notlar: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
});

module.exports = Anamnes;