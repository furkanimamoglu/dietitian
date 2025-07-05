const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Notification = sequelize.define('Notification', {
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
                notNull: {
                    msg: 'Danışan ID belirtilmelidir'
                }
            }
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: {
                    msg: 'Okunma durumu belirtilmelidir'
                }
            }
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Bildirim içeriği gereklidir'
                },
                notEmpty: {
                    msg: 'Bildirim içeriği boş olamaz'
                },
                len: {
                    args: [1, 255],
                    msg: 'Bildirim en fazla 255 karakter olabilir'
                }
            }
        }
    }
);

module.exports = Notification;