const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Invoice = sequelize.define('Invoice', {
        id: {
            type: DataTypes.BIGINT,
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
                    msg: "Diyetisyen ID'si bir tam sayı olmalıdır."
                },
                notNull: {
                    msg: "Diyetisyen ID'si gereklidir."
                }
            }
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
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isDecimal: {
                    msg: "Tutar bir ondalık sayı olmalıdır."
                },
                min: {
                    args: [0],
                    msg: "Tutar 0'dan büyük olmalıdır."
                },
                notNull: {
                    msg: "Tutar gereklidir."
                }
            }
        },
        paid_amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isDecimal: {
                    msg: "Ödenen tutar bir ondalık sayı olmalıdır."
                },
                min: {
                    args: [0],
                    msg: "Ödenen tutar 0'dan büyük olmalıdır."
                },
                notNull: {
                    msg: "Ödenen tutar gereklidir."
                }
            }
        },
        status: {
            type: DataTypes.ENUM('paid', 'partiallypaid', 'unpaid', 'cancelled'),
            allowNull: false,
            defaultValue: 'unpaid',
            validate: {
                isIn: {
                    args: [['paid', 'partiallypaid', 'unpaid', 'cancelled']],
                    msg: "Durum 'paid', 'partiallypaid', 'unpaid' veya 'cancelled' olmalıdır."
                }
            }
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                isInt: {
                    msg: "Paket ID'si bir tam sayı olmalıdır."
                }
            }
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: {
                    msg: "Fatura tarihi geçerli bir tarih olmalıdır."
                },
                notNull: {
                    msg: "Fatura tarihi gereklidir."
                }
            }
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "Son ödeme tarihi geçerli bir tarih olmalıdır."
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 5000],
                    msg: "Açıklama en fazla 5000 karakter olmalıdır."
                }
            }
        }
    }
);

module.exports = Invoice;