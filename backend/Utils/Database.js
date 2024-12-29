const {Sequelize} = require('sequelize');
const config = require('../config.json');

const sequelize = new Sequelize(
    config.database_connection.database,
    config.database_connection.user,
    config.database_connection.password,
    {
        host: config.database_connection.host,
        logging: config.database_options.logging,
        dialect: "postgres"
    }
);

module.exports = sequelize;