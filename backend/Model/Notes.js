const path = require('path');
const {DataTypes} = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    dietitian_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Diyetisyen ID gereklidir'
            },
            isInt: {
                msg: 'Diyetisyen ID bir tamsayı olmalıdır'
            }
        }
    },
    noteContent: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 5000],
                msg: 'Not içeriği en fazla 2000 karakter olabilir'
            }
        }
    }
}, {
    timestamps: true
});

module.exports = Note;
