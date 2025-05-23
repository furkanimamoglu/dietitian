// Library
const express = require('express');
const sequelize = require('./Utils/Database');
const bodyParser = require('body-parser');
const config = require('./config.json');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');

// Models
require('./Model/MainModel');

// Express App
const app = express();

// Routes
const dietitianRoutes = require('./Routes/dietitianRoutes');
const clientRoutes = require('./Routes/clientRoutes');
const appointmentRoutes = require('./Routes/appointmentRoutes');
const invoiceRoutes = require('./Routes/invoiceRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const measurementRoutes = require('./Routes/measurementRoutes');
const recipeRoutes = require('./Routes/recipeRoutes');
const exerciseRoutes = require('./Routes/exerciseRoutes');
const anamnesRoutes = require('./Routes/anamnesRoutes');
const packageRoutes = require('./Routes/packageRoutes');
const MessageService = require("./Service/messageService");

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

// Socket.IO Server
const ioServer = http.createServer();
const io = new Server(ioServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Client Connected: ' + socket.id);

    socket.on('send_message', async (token, partner_id, message, callback) => {
        try {
            console.log('Message Sent - Partner ID:', partner_id, "Message:", message);

            const result = await MessageService.sendMessage(token, partner_id, message);

            callback({ status: 'ok', result });

        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);

            callback({ status: 'error', message: error.message || 'Bilinmeyen hata' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client Disconnected: ' + socket.id);
    });
});

ioServer.listen(4000, () => {
    console.log('✅ Socket.IO sunucusu 4000 portunda çalışıyor.');
});