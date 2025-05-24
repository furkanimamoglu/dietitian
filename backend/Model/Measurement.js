const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Measurement = sequelize.define('Measurement', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Bel ölçüsü bir tam sayı olmalıdır."
            },
            min: {
                args: [10],
                msg: "Bel ölçüsü en az 10 cm olmalıdır."
            },
            max: {
                args: [300],
                msg: "Bel ölçüsü en fazla 300 cm olmalıdır."
            },
            notNull: {
                msg: "Bel ölçüsü gereklidir."
            }
        }
    },
    kalca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Kalça ölçüsü bir tam sayı olmalıdır."
            },
            min: {
                args: [10],
                msg: "Kalça ölçüsü en az 40 cm olmalıdır."
            },
            max: {
                args: [300],
                msg: "Kalça ölçüsü en fazla 200 cm olmalıdır."
            },
            notNull: {
                msg: "Kalça ölçüsü gereklidir."
            }
        }
    },
    gogus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Göğüs ölçüsü bir tam sayı olmalıdır."
            },
            min: {
                args: [10],
                msg: "Göğüs ölçüsü en az 30 cm olmalıdır."
            },
            max: {
                args: [300],
                msg: "Göğüs ölçüsü en fazla 200 cm olmalıdır."
            },
            notNull: {
                msg: "Göğüs ölçüsü gereklidir."
            }
        }
    },
    yag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Vücut yağ oranı bir tam sayı olmalıdır."
            },
            min: {
                args: [1],
                msg: "Vücut yağ oranı en az %1 olmalıdır."
            },
            max: {
                args: [70],
                msg: "Vücut yağ oranı en fazla %70 olmalıdır."
            },
            notNull: {
                msg: "Vücut yağ oranı gereklidir."
            }
        }
    },
    kas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Kas kütlesi bir tam sayı olmalıdır."
            },
            min: {
                args: [10],
                msg: "Kas kütlesi en az %10 olmalıdır."
            },
            max: {
                args: [80],
                msg: "Kas kütlesi en fazla %80 olmalıdır."
            },
            notNull: {
                msg: "Kas kütlesi gereklidir."
            }
        }
    },
    su: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Vücut su oranı bir tam sayı olmalıdır."
            },
            min: {
                args: [20],
                msg: "Vücut su oranı en az %20 olmalıdır."
            },
            max: {
                args: [90],
                msg: "Vücut su oranı en fazla %90 olmalıdır."
            },
            notNull: {
                msg: "Vücut su oranı gereklidir."
            }
        }
    }
});

module.exports = Measurement;