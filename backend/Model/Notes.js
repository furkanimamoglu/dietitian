const {DataTypes} = require('sequelize');
const sequelize = require('../Utils/Database');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dietitian_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    noteContent: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true
});

module.exports = Note;
