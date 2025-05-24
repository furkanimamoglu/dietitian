const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Randevu başlığı boş bırakılamaz.'
            },
            notEmpty: {
                msg: 'Randevu başlığı boş olamaz.'
            }
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {
            notNull: {
                msg: 'Durum alanı boş bırakılamaz.'
            },
            isIn: {
                args: [['pending', 'approved', 'cancelled']],
                msg: 'Durum değeri geçerli olmalıdır.'
            }
        }
    },
    start: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Başlangıç tarihi boş bırakılamaz.'
            }
        }
    },
    end: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Bitiş tarihi boş bırakılamaz.'
            }
        }
    },
    dietitian_id: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Danışan ID alanı boş bırakılamaz.'
            },
            isInt: {
                msg: 'Danışan ID sayısal bir değer olmalıdır.'
            }
        }
    }
}, {
    timestamps: false,
});

module.exports = Appointment;