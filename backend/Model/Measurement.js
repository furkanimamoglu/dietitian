const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Measurement = sequelize.define('Measurement', {
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Danışan ID'si bir tam sayı olmalıdır."
            },
            notNull: {
                msg: "Danışan ID'si gereklidir."
            }
        }
    },
    boy: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    kilo: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    bel: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    kalca: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    gogus: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    digerbel: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    kol: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    bacak: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    yag: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    kas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    su: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Measurement;