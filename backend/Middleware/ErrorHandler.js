const path = require('path');
const crypto = require('crypto');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {logError} = require(path.join(__dirname, '..', 'Utils', 'Logger'));

const GENERIC_MESSAGE = 'Bir hata oluştu.';

/**
 * Hata beklenmeyen bir hata mı (özel mesajla bilinçli olarak fırlatılmamış)?
 * Exception'lar ve düz objeler ({status, message}) bilinçli olarak fırlatılır.
 */
function isUnexpected(error) {
    return error instanceof Error && !(error instanceof Exception);
}

/**
 * Request Context - Her isteğe bir id verir (X-Request-Id header) ve 5xx yanıtlarda
 * beklenmeyen hataların (DB, runtime) ham mesajlarının kullanıcıya gitmesini engeller.
 * Özel mesajlar (Exception veya controller'daki fallback metinler) olduğu gibi korunur.
 * @author Furkan İmamoğlu
 */
function requestContext(req, res, next) {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);

    const json = res.json.bind(res);
    res.json = (body) => {
        const error = res.locals.error;
        if (res.statusCode >= 500 && isUnexpected(error) && body && typeof body === 'object' && body.message === error.message) {
            body = {...body, message: GENERIC_MESSAGE, requestId: req.id};
        }
        return json(body);
    };

    next();
}

/**
 * Not Found - Bilinmeyen endpoint'ler için JSON 404.
 */
function notFound(req, res) {
    res.status(404).json({
        showOnScreen: false,
        message: 'İstenen kaynak bulunamadı.'
    });
}

/**
 * Error Handler - Controller'larda yakalanmayan hatalar için son durak (body parse hataları, multer, try/catch'i olmayan handler'lar).
 */
function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    logError(req, error);

    let status = Number(error?.status || error?.statusCode) || 500;
    if (error?.name === 'MulterError') status = 400;

    let message;
    if (typeof error?.type === 'string' && error.type.startsWith('entity.')) {
        message = 'Geçersiz istek.';
    } else if (status >= 500 && isUnexpected(error)) {
        message = GENERIC_MESSAGE;
    } else {
        message = error?.message || GENERIC_MESSAGE;
    }

    res.status(status).json({
        showOnScreen: error?.showOnScreen ?? false,
        message,
        ...(status >= 500 && {requestId: req.id})
    });
}

module.exports = {requestContext, notFound, errorHandler};
