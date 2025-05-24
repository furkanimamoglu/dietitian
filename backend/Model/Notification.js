const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
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
                        msg: 'Mesaj içeriği gereklidir'
                    },
                    notEmpty: {
                        msg: 'Mesaj içeriği boş olamaz'
                    },
                    len: {
                        args: [1, 500],
                        msg: 'Mesaj en fazla 500 karakter olabilir'
                    }
                }
            }
        }
);

module.exports = Notification;