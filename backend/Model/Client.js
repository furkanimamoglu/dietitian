// Libraries
const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Appointment = require('./Appointment');
const Anamnesis = require('./Anamnes');
const Invoice = require('./Invoice');

const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        dietitian_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Bu e-posta zaten kullanılıyor.'
            },
            validate: {
                isEmail: {
                    msg: 'E-posta adresi geçerli olmalıdır.'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [4, 21],
                    msg: 'Şifre 4 ile 21 karakter arasında olmak zorundadır.'
                }
            }
        },
        phoneNumber: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "true",
        },
        language: DataTypes.STRING,
        gender: DataTypes.STRING,
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }
);

Client.hasMany(Anamnesis, {
    foreignKey: "client_id"
});

Client.hasMany(Invoice, {
    foreignKey: "client_id"
});

Client.hasMany(Appointment, {
    foreignKey: "client_id"
});

Appointment.belongsTo(Client, {
    foreignKey: "client_id"
});


module.exports = Client;