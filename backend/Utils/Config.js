const path = require('path');

require('dotenv').config({path: path.join(__dirname, '..', '.env'), quiet: true});

const file = require(path.join(__dirname, '..', 'config.json'));

/**
 * Required environment variable. Throws on startup if it's missing.
 * @param {string} key
 * @returns {string}
 */
function required(key) {
    const value = process.env[key];
    if (value === undefined || value === '') {
        throw new Error(`ERROR - .env dosyasında ${key} tanımlı değil.`);
    }
    return value;
}

/**
 * Config - Merges config.json (non-secret app settings) and .env (secrets, environment specific values).
 * @author Furkan İmamoğlu
 */
const config = {
    ...file,
    nodeEnv: process.env.NODE_ENV || 'production',
    logLevel: process.env.LOG_LEVEL || 'info',
    // Sadece development'ta, kapatılmadıysa açılışta demo veri oluşturulur.
    seedOnStart: (process.env.NODE_ENV || 'production') === 'development' && process.env.SEED_ON_START !== 'false',
    ddl: required('DDL'),
    secretkey: required('JWT_SECRET'),
    server: {
        port: Number(process.env.PORT) || 3000
    },
    database_connection: {
        host: required('DB_HOST'),
        database: required('DB_NAME'),
        user: required('DB_USER'),
        password: required('DB_PASSWORD')
    },
    mailAuth: {
        emailAddress: required('MAIL_ADDRESS'),
        emailAppPassword: required('MAIL_APP_PASSWORD')
    },
    s3: {
        ...file.s3,
        accessKeyId: required('S3_ACCESS_KEY_ID'),
        secretAccessKey: required('S3_SECRET_ACCESS_KEY')
    }
};

module.exports = Object.freeze(config);
