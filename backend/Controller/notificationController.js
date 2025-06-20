const path = require("path");

const NotificationService = require(path.join(__dirname, "..", "Service", "NotificationService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {DIETITIAN} = require(path.join(__dirname, "..", "Enum", "Role"));

class notificationController {

    static async sendNotificationToClient(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id, notificationData} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        try {
            const result = await NotificationService.sendNotificationToClient(dietitian_id, client_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

}

module.exports = notificationController;