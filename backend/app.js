// Library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const rateLimit = require('express-rate-limit');

// Config
const config = require(path.join(__dirname, 'config.json'));
// Database
const sequelize = require(path.join(__dirname, 'Utils', 'Database'));
// Exception
const Exception = require(path.join(__dirname, 'Exception', 'Exception'));
// Models
require(path.join(__dirname, 'Model', 'MainModel'));
// Utils
const Security = require(path.join(__dirname, 'Utils','Security'));
// Enum
const {DIETITIAN, CLIENT} = require(path.join(__dirname, "Enum", "Role"));

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
const notificationRoutes = require(path.join(__dirname, "Routes", "notificationRoutes"));

const multer = require('multer');
const multerS3 = require('multer-s3');

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

app.get('/api/version', (req, res) => {
    res.json({
        version: config.version
    });
});

app.use('/uploads', express.static('uploads'));

const ALLOWED_TYPES = ['profilephoto', 'meal', 'exercise', 'nutrition', 'recipe', 'message'];

function sanitize(str) {
    return String(str || '').replace(/[^a-z0-9_-]/gi, '_');
}

const upload = multer({
    storage: multer.memoryStorage()
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ showOnScreen: true, message: 'Yüklenecek dosya eklenmedi.' });
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
        return res.status(400).json({ showOnScreen: true, message: 'Sadece resim dosyaları yüklenebilir.' });
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
        return res.status(400).json({ showOnScreen: true, message: 'Dosya boyutu 5MB\'ı geçemez.' });
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Exception('Token eksik.');

        const userId = Security.getUserIdFromToken(token);
        const role = Security.getPermissionFromToken(token);
        const clientId = sanitize(req.query.client_id);
        const type = sanitize(req.query.type);

        if (!ALLOWED_TYPES.includes(type)) {
            throw new Exception('Geçersiz yükleme türü.');
        }

        const folderPath = `${role === DIETITIAN ? 'Dietitian' : 'Client'}/${sanitize(userId)}${clientId ? '/' + clientId : ''}/${type}`;
        const uniqueSuffix = `${new Date().toISOString().split('T')[0]}`;
        const sanitizedFileName = sanitize(req.file.originalname).toLowerCase().replace(/\s+/g, '-');
        const fileName = `${folderPath}/${uniqueSuffix}.${sanitizedFileName}`;

        const s3Client = new S3Client({
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey
            },
            region: config.s3.region
        });

        const params = {
            Bucket: config.s3.bucketName,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
        };

        try {
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
            const imageUrl = `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${fileName}`;
            res.json({ imageUrl });
        } catch (err) {
            console.error('Dosya yükleme hatası:', err);
            res.status(500).json({ showOnScreen: true, message: 'Dosya yüklenirken bir hata oluştu.' });
        }
    } catch (err) {
        console.error('Dosya yükleme hatası:', err);
        res.status(500).json({ showOnScreen: true, message: 'Dosya yüklenirken bir hata oluştu.' });
    }
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { showOnScreen: true, message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Routers
app.use('/api/dietitian', dietitianRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/anamnes', anamnesRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/measurement', measurementRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/notification', notificationRoutes);

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