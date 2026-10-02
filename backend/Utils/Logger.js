const path = require('path');
const pino = require('pino');

const config = require(path.join(__dirname, 'Config'));

/*
 * Logger - Merkezi, yapılandırılmış (JSON) logger.
 * Kişisel veriler asla loga düşmez:
 *  - request body, query string ve header'lar loglanMAZ (sadece id, method, path, user id, rol).
 *  - hatalar allowlist ile serialize edilir (Sequelize sql/parameters/value alanları atılır).
 *  - message ve stack metinlerindeki email, telefon numarası ve token'lar maskelenir.
 * Not: database_options.logging false kalmalı, Sequelize SQL logları sorgu parametrelerini içerir.
 */

const REDACTED = '[REDACTED]';

// Hangi derinlikte olursa olsun değeri asla loglanmayacak key'ler.
const SENSITIVE_KEYS = [
    'password', 'oldPassword', 'newPassword', 'token', 'fcmToken', 'authorization', 'cookie',
    'secretkey', 'secretAccessKey', 'accessKeyId', 'emailAppPassword', 'verificationCode',
    'email', 'phoneNumber', 'name', 'ipAddress', 'profilePhoto',
    'saglik_bilgileri', 'diyet_aliskanliklari', 'fiziksel_aktivite', 'ozel_notlar', 'note', 'notes', 'dietitianNotes',
    'message', 'notificationData', 'body', 'query', 'headers', 'sql', 'parameters'
];
const SENSITIVE_KEY_SET = new Set(SENSITIVE_KEYS.map(key => key.toLowerCase()));

const SCRUB_PATTERNS = [
    /Bearer\s+\S+/gi,
    /eyJ[\w-]+\.[\w-]+\.[\w-]+/g,
    /[\w.+-]+@[\w-]+(\.[\w-]+)+/g,
    /\+?\d(?:[\s-]?\d){9,}/g
];

// Çıktı process.stdout üzerinden yazılır: pino'nun varsayılan hedefi (fd 1'e ham byte) Windows konsolunda
// aktif kod sayfasına (857, 437...) göre yorumlanıp Türkçe karakterleri bozar; process.stdout UTF-8'i doğru aktarır.
// Development'ta pino-pretty worker thread yerine ana thread'de stream olarak çalışır, aynı sebeple.
const destination = config.nodeEnv === 'development'
    ? require('pino-pretty')({translateTime: 'SYS:standard', destination: process.stdout})
    : process.stdout;

const logger = pino({
    level: config.logLevel,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    // pino'nun varsayılan err serializer'ı tüm alanları (sql, parameters...) kopyalar, bu yüzden ham hatalar bizimkinden geçer.
    serializers: {
        err: value => value instanceof Error ? serializeError(value) : value
    },
    redact: {
        // err.name / err.message serializeError tarafından serialize edilip maskelendiği için burada redact edilmez.
        paths: SENSITIVE_KEYS.filter(key => key !== 'name' && key !== 'message').flatMap(key => [key, `*.${key}`]),
        censor: REDACTED
    }
}, destination);

/**
 * Metindeki email, telefon numarası ve token'ları maskeler.
 * @param {*} text
 * @returns {string|undefined}
 */
function scrub(text) {
    if (text === undefined || text === null) return text;
    return SCRUB_PATTERNS.reduce((result, pattern) => result.replace(pattern, REDACTED), String(text));
}

/**
 * Objeyi derin kopyalar, hassas key'lerin değerlerini maskeler. Ek context loglamadan önce kullanılmalı.
 * @param {*} value
 * @returns {*}
 */
function sanitize(value, depth = 0) {
    if (depth > 5) return REDACTED;
    if (Array.isArray(value)) return value.map(item => sanitize(item, depth + 1));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) =>
            [key, SENSITIVE_KEY_SET.has(key.toLowerCase()) ? REDACTED : sanitize(item, depth + 1)]
        ));
    }
    return typeof value === 'string' ? scrub(value) : value;
}

/**
 * Fırlatılan her şey için allowlist serializer (Error, Exception, Sequelize hataları, düz objeler).
 * @param {*} error
 * @param {boolean} withStack
 * @returns {object}
 */
function serializeError(error, withStack = true) {
    if (!error || typeof error !== 'object') {
        return {message: scrub(error)};
    }

    // body-parser hatalarının mesajı ham request body'den bir parça içerir.
    if (typeof error.type === 'string' && error.type.startsWith('entity.')) {
        return {name: error.name, type: error.type, status: error.status};
    }

    return {
        name: error.name,
        message: scrub(error.message),
        status: error.status,
        code: error.code || error.parent?.code,
        ...(Array.isArray(error.errors) && {
            errors: error.errors.map(item => ({path: item.path, type: item.type, validatorKey: item.validatorKey}))
        }),
        ...(withStack && error.stack && {stack: scrub(error.stack)})
    };
}

/**
 * Sadece kişisel veri içermeyen request bilgileri.
 * @param req - Express request
 * @returns {object}
 */
function requestInfo(req) {
    if (!req) return undefined;
    return {
        id: req.id,
        method: req.method,
        path: (req.originalUrl || req.url || '').split('?')[0],
        userId: req.user?.id,
        role: req.user?.role
    };
}

/**
 * Request işlenirken yakalanan hatayı loglar.
 * 4xx hatalar stack'siz warn, diğerleri stack'li error olarak loglanır.
 * @param req - Express request
 * @param {*} error
 */
function logError(req, error) {
    if (req?.res) req.res.locals.error = error;

    const status = Number(error?.status || error?.statusCode) || 500;
    const entry = {req: requestInfo(req), err: serializeError(error, status >= 500)};

    if (status < 500) {
        logger.warn(entry, 'Request failed');
    } else {
        logger.error(entry, 'Unexpected error');
    }
}

module.exports = {logger, logError, sanitize, scrub, serializeError};
