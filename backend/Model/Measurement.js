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
        allowNull: false,
        validate: {
            isInt: {
                msg: "Boy değeri bir tam sayı olmalıdır."
            },
            min: {
                args: [50],
                msg: "Boy değeri en az 50 cm olmalıdır."
            },
            max: {
                args: [300],
                msg: "Boy değeri en fazla 300 cm olmalıdır."
            },
            notNull: {
                msg: "Boy değeri gereklidir."
            }
        }
    },
    kilo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Kilo değeri bir tam sayı olmalıdır."
            },
            min: {
                args: [10],
                msg: "Kilo değeri en az 10 kg olmalıdır."
            },
            max: {
                args: [500],
                msg: "Kilo değeri en fazla 500 kg olmalıdır."
            },
            notNull: {
                msg: "Kilo değeri gereklidir."
            }
        }
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
    gogusdiger: {
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