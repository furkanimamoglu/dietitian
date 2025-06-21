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

        if (!notificationData) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Bildirim verisi gereklidir."
            });
        }

        if (!notificationData.title || !notificationData.body) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Bildirim başlığı ve içeriği zorunludur."
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

    static async sendNotificationToAllMyClients(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {notificationData} = req.body;

        if (!notificationData) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Bildirim verisi gereklidir."
            });
        }

        if (!notificationData.title || !notificationData.body) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Bildirim başlığı ve içeriği zorunludur."
            });
        }

        try {
            const result = await NotificationService.sendNotificationToAllMyClients(dietitian_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async sendAppointmentReminder(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id, appointmentDetails} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        if (!appointmentDetails || !appointmentDetails.date || !appointmentDetails.time) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Randevu detayları gereklidir."
            });
        }

        try {
            const notificationData = {
                title: "✨ Randevu Zamanı! ✨",
                body: `Hey! ${appointmentDetails.date} tarihinde ${appointmentDetails.time} saatinde diyetisyeninizle görüşmeniz var!`,
                data: appointmentDetails
            };
            const result = await NotificationService.sendNotificationToClient(dietitian_id, client_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async sendNutritionPlanAssignedNotification(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        try {
            const notificationData = {
                title: "📋 Yeni Beslenme Planı! 📋",
                body: `Diyetisyeniniz yeni beslenme programınızı ekledi! Hemen göz atın!`,
                data: {}
            };
            const result = await NotificationService.sendNotificationToClient(dietitian_id, client_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async sendExerciseAssignedNotification(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        try {
            const notificationData = {
                title: "🏋️ Yeni Egzersiz Programı! 🏋️",
                body: `Diyetisyeniniz yeni egzersiz programınızı ekledi! Hemen göz atın!`,
                data: {}
            };
            const result = await NotificationService.sendNotificationToClient(dietitian_id, client_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async sendPaymentReminderNotification(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id, due_date, amount} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        if (!due_date) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Ödeme tarihi gereklidir."
            });
        }

        if (!amount) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Ödeme tutarı gereklidir."
            });
        }

        try {
            const notificationData = {
                title: "💰 Ödeme Hatırlatması! 💰",
                body: `${due_date} tarihine kadar ${amount} TL tutarındaki ödemenizi diyetisyeninize yapmayı unutmayın!`,
                data: {
                    due_date: `${due_date}`,
                    amount: `${amount}`
                }
            };
            const result = await NotificationService.sendNotificationToClient(dietitian_id, client_id, notificationData);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async sendRecipeAssignedNotification(req, res) {
        const token = req.headers.authorization;
        const dietitian_id = Security.getUserIdFromToken(token);
        const permission = Security.checkUserPermission(token, DIETITIAN);

        if (!token || !dietitian_id || !permission) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        const {client_id} = req.body;

        if (!client_id) {
            return res.status(400).json({
                showOnScreen: true,
                message: "Client ID is required."
            });
        }

        try {
            const notificationData = {
                title: "🍽️ Yeni Tarif! 🍽️",
                body: `Diyetisyeniniz yeni bir tarif ekledi! Hemen göz atın!`,
                data: {}
            };
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