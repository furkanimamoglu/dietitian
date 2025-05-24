const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isInt: {
                    msg: "Diyetisyen ID bir tamsayı olmalıdır"
                },
                notNull: {
                    msg: "Diyetisyen ID alanı boş bırakılamaz"
                }
            }
        },
        client_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isInt: {
                    msg: "Danışan ID bir tamsayı olmalıdır"
                },
                notNull: {
                    msg: "Danışan ID alanı boş bırakılamaz"
                }
            }
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Gönderen alanı boş olamaz"
                },
                isIn: {
                    args: [['dietitian', 'client']],
                    msg: "Gönderen alanı 'dietitian' veya 'client' olmalıdır"
                }
            }
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Mesaj içeriği boş olamaz"
                },
                len: {
                    args: [1, 5000],
                    msg: "Mesaj 1-5000 karakter arasında olmalıdır"
                }
            }
        }
    }, {
        timestamps: true
    }
);

module.exports = Message;