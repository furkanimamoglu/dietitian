// Library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");

const config = require(path.join(__dirname, 'config.json'));
const sequelize = require(path.join(__dirname, 'Utils', 'Database'));


// Models
require(path.join(__dirname, 'Model', 'MainModel'));


// Express App
const app = express();

// Routes
const dietitianRoutes = require(path.join(__dirname, "Routes", "dietitianRoutes"));
const clientRoutes = require(path.join(__dirname, "Routes", "clientRoutes"));
const appointmentRoutes = require(path.join(__dirname, "Routes", "appointmentRoutes"));
const invoiceRoutes = require(path.join(__dirname, "Routes", "invoiceRoutes"));
const messageRoutes = require(path.join(__dirname, "Routes", "messageRoutes"));
const measurementRoutes = require(path.join(__dirname, "Routes", "measurementRoutes"));
const recipeRoutes = require(path.join(__dirname, "Routes", "recipeRoutes"));
const exerciseRoutes = require(path.join(__dirname, "Routes", "exerciseRoutes"));
const anamnesRoutes = require(path.join(__dirname, "Routes", "anamnesRoutes"));
const packageRoutes = require(path.join(__dirname, "Routes", "packageRoutes"));

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, User-Agent');
    next();
});

// Routers
app.use('/dietitian', dietitianRoutes);
app.use('/client', clientRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/anamnes', anamnesRoutes);
app.use('/message', messageRoutes);
app.use('/recipe', recipeRoutes);
app.use('/exercise', exerciseRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/message', messageRoutes);
app.use('/measurement', measurementRoutes);
app.use('/package', packageRoutes);

// Working Directory
try {
    process.chdir('../');
    console.log('INFO - Çalışma Dizini: ' + process.cwd());
} catch (error) {
    console.error('ERROR - ' + error);
}

// Database Connection
try {
    sequelize.authenticate().then(() => console.log("INFO - Sequelize Authenticated to Database."));
    console.log('INFO - Veritabanı bağlantısı başarıyla kuruldu.');
} catch (error) {
    console.error('ERROR - Veritabanına bağlanılamadı:', error);
}

// Server
if (config.ddl === "create-drop") {
    sequelize.sync({force: true}).then(() => {
        app.listen(config.server.port);
    }).catch(err => {
        console.log(err)
    });
    console.log('INFO - Sequelize, create-drop yöntemiyle veritabanı ile senkronize edildi. Tüm tablolar yeniden oluşturuldu, eski veriler silindi.');
} else if (config.ddl === "update") {
    sequelize.sync().then(() => {
        app.listen(config.server.port);
        console.log(`INFO - Sunucu http://localhost:${config.server.port} portunda çalışıyor.`);
    }).catch(err => {
        console.log(err)
    });
    console.log('INFO - Sequelize, update yöntemiyle veritabanı ile senkronize edildi. Veriler değişmedi.');
} else {
    console.log("ERROR - config.js dosyasını kontrol edin.");
}