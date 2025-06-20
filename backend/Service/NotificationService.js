const path = require('path');

const admin = require("firebase-admin");
const serviceAccount = require("../diyetiacom-firebase-adminsdk-fbsvc-bfd2868823.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const {
    Client
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
            throw new Exception("Client için bildirim token'ı bulunamadı");
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
        return response;
    }

}

module.exports = NotificationService;