const path = require('path');
const {logger, serializeError} = require(path.join(__dirname, '..', 'Utils', 'Logger'));

const admin = require("firebase-admin");
const serviceAccount = require("../diyetiacom-firebase-adminsdk-fbsvc-bfd2868823.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const {
    Client,
    Notification
} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));

class NotificationService {

    static async sendNotificationToClient(dietitian_id, client_id, notificationData) {
        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Bu client belirtilen diyetisyene ait değil veya bulunamadı");
        }

        let clientToken = client.fcmToken;

        if (!clientToken && notificationData.token) {
            clientToken = notificationData.token;
        }

        if (!clientToken) {
            throw new Exception("Danışanınız mobil uygulamayı henüz kullanmamış veya indirmemiş, bildirim gönderilemez.", 400, true);
        }

        const message = {
            notification: {
                title: notificationData.title,
                body: notificationData.body
            },
            data: notificationData.data,
            token: clientToken
        };

        const response = await admin.messaging().send(message);

        if (response) {
            try {
                await this.saveNotification(client_id, notificationData.body);
            } catch (saveError) {
                logger.error({err: serializeError(saveError), clientId: client_id}, 'Bildirim kaydedilirken hata oluştu.');
            }
        }

        return response;
    }

    static async sendNotificationToAllMyClients(dietitian_id, notificationData) {
        const clients = await Client.findAll({
            where: {
                dietitian_id: dietitian_id
            }
        });

        if (clients.length === 0) {
            throw new Exception("Bu diyetisyene ait client bulunamadı");
        }

        const tokens = clients
            .map(client => client.fcmToken)
            .filter(token => !!token);

        if (tokens.length === 0) {
            throw new Exception("Hiçbir client için bildirim token'ı bulunamadı");
        }

        const multicastMessage = {
            notification: {
                title: notificationData.title,
                body: notificationData.body
            },
            data: notificationData.data,
            tokens: tokens
        };
        // INFO: 500 danışana kadar destekler, sistemde birisinin bundan daha fazla danışan varsa, foreache dön.
        const response = await admin.messaging().sendEachForMulticast(multicastMessage);

        const successCount = response.responses.filter(r => r.success).length;
        const failureCount = response.responses.length - successCount;

        if (successCount > 0) {
            const clientsWithTokens = clients.filter(client => client.fcmToken);

            for (let i = 0; i < response.responses.length; i++) {
                if (response.responses[i].success) {
                    try {
                        const client = clientsWithTokens[i];
                        await this.saveNotification(client.id, notificationData.body);
                    } catch (saveError) {
                        logger.error({err: serializeError(saveError), clientId: clientsWithTokens[i]?.id}, 'Bildirim kaydedilirken hata oluştu.');
                    }
                }
            }
        }

        return response;
    }

    static async saveNotification(client_id, message) {
        try {
            if (!client_id) {
                throw new Exception("Müşteri ID gereklidir.", 400, true);
            }

            if (!message || message.trim() === '') {
                throw new Exception("Bildirim mesajı gereklidir.", 400, true);
            }

            const client = await Client.findByPk(client_id);
            if (!client) {
                throw new Exception("Müşteri bulunamadı.", 404, true);
            }

            const notification = await Notification.create({
                client_id: client_id,
                message: message.trim(),
                isRead: false
            });

            return {
                showOnScreen: false,
                notification: notification,
                message: "Bildirim başarıyla kaydedildi."
            };
        } catch (error) {
            throw new Exception(error.message, error.status || 500, error.showOnScreen || true);
        }
    }

}

module.exports = NotificationService;