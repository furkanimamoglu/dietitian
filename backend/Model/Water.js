const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Water = sequelize.define('Water', {
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Tarih boş bırakılamaz.'
                },
                isDate: {
                    msg: 'Tarih formatı geçersiz.'
                }
            }
        },
        amount_ml: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Su miktarı boş bırakılamaz.'
                },
                isInt: {
                    msg: 'Su miktarı sayısal olmalıdır.'
                },
                min: {
                    args: [0],
                    msg: 'Su miktarı negatif olamaz.'
                }
            }
        }
    },
    {
        timestamps: false,
    }
);

module.exports = Water;