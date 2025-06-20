const admin = require("firebase-admin");
const serviceAccount = require("../diyetiacom-firebase-adminsdk-fbsvc-bfd2868823.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

class Notification {
    /**
     * Belirtilen kullanıcıya bildirim gönderir
     * @param {string} token - Kullanıcının Firebase token'ı
     * @param {string} title - Bildirim başlığı
     * @param {string} body - Bildirim içeriği
     * @param {Object} data - İlave veri (opsiyonel)
     * @returns {Promise<Object>} Bildirim sonucu
     */
    static async send(token, title, body, data = {}) {
        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data,
                token
            };

            const response = await admin.messaging().send(message);
            console.log('Bildirim başarıyla gönderildi:', response);
            return { success: true, response };
        } catch (error) {
            console.error('Bildirim gönderme hatası:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Birden fazla kullanıcıya aynı bildirim gönderir
     * @param {Array<string>} tokens - Kullanıcıların Firebase token'ları
     * @param {string} title - Bildirim başlığı
     * @param {string} body - Bildirim içeriği
     * @param {Object} data - İlave veri (opsiyonel)
     * @returns {Promise<Object>} Bildirim sonucu
     */
    static async sendMultiple(tokens, title, body, data = {}) {
        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data,
                tokens
            };

            const response = await admin.messaging().sendMulticast(message);
            console.log(`Bildirim gönderildi - Başarılı: ${response.successCount}, Başarısız: ${response.failureCount}`);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses
            };
        } catch (error) {
            console.error('Toplu bildirim gönderme hatası:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = Notification;
