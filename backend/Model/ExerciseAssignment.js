const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const ExerciseAssignment = sequelize.define('ExerciseAssignment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Clients',
            key: 'id'
        }
    },
    exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Exercises',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'pending', 'cancelled'),
        allowNull: false,
        defaultValue: 'active'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'ExerciseAssignments',
    timestamps: true
});

module.exports = ExerciseAssignment;
