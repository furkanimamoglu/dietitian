// Library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const fs = require('fs');

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
const nutritionRoutes = require(path.join(__dirname, "Routes", "nutritionRoutes"));
const {diskStorage} = require("multer");
const multer = require("multer");

app.use(bodyParser.json());

app.use(cors({
    origin: true,
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, User-Agent');
    next();
});


// Static Files
app.use('/uploads', express.static('uploads'));

const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Dosya Yükleme Uç Noktası (Güvenli)
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ showOnScreen: true, message: 'Yüklenecek dosya eklenmedi.' });
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ showOnScreen: true, message: 'Sadece resim dosyaları yüklenebilir.' });
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ showOnScreen: true, message: 'Dosya boyutu 5MB\'ı geçemez.' });
    }

    const imageUrl = `${config.image_url}${req.file.filename}`;
    res.json({ imageUrl });
});

// Routers
app.use('/api/dietitian', dietitianRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/anamnes', anamnesRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/measurement', measurementRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/nutrition', nutritionRoutes);


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