const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

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
