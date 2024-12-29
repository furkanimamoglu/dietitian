// Library
const express = require('express');
const sequelize = require('./Utils/Database');
const bodyParser = require('body-parser');
const config = require('./config.json');

// Models
require('./Model/Client');
require('./Model/Dietitian');
require('./Model/Exercise');
require('./Model/Anamnes');
require('./Model/Recipe');
require('./Model/Invoice');
require('./Model/Appointment');

// Express App
const app = express();

// Routes
const dietitianRoutes = require('./Routes/dietitianRoutes');
const clientRoutes = require('./Routes/clientRoutes');
const systemRoutes = require('./Routes/systemRoutes');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, User-Agent');
    next();
});

// Routers
app.use('/dietitian', dietitianRoutes);
app.use('/client', clientRoutes);
app.use('/system', systemRoutes);

// Working Directory
try {
    process.chdir('../');
    console.log('INFO - Working Directory: ' + process.cwd());
} catch (error) {
    console.error('ERROR - ' + error);
}

// Database Connection
try {
    sequelize.authenticate().then(() => console.log("INFO - Sequelize Authenticated to Database."));
    console.log('INFO - Database Connection has been established successfully.');
} catch (error) {
    console.error('ERROR - Unable to connect to the database:', error);
}

// Server
if (config.ddl === "create-drop") {
    sequelize.sync({force: true}).then(() => {
        app.listen(config.server.port);
    }).catch(err => {
        console.log(err)
    });
    console.log('INFO - Sequelize is synchronized with database by create-drop. All tables are created again, old data is deleted.');
} else if (config.ddl === "update") {
    sequelize.sync().then(() => {
        app.listen(config.server.port);
    }).catch(err => {
        console.log(err)
    });
    console.log('INFO - Sequelize is synchronized with database by update. Data kept same.');
} else {
    console.log("ERROR - Check config.js");
}