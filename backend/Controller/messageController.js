const path = require("path");

const MessageService = require(path.join(__dirname, "..", "Service", "MessageService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));

class messageController {

    static async getMyMessages(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            const user_role = Security.getPermissionFromToken(token);

            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {partner_id} = req.query;

            const result = await MessageService.getMyMessages(user_id, user_role, partner_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async sendMessage(req, res) {
        try {
            const token = req.headers.authorization;
            const sender_id = Security.getUserIdFromToken(token);
            const sender_role = Security.getPermissionFromToken(token);

            const {receiver_id, message} = req.body;

            const result = await MessageService.sendMessage(receiver_id, sender_id, sender_role, message);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = messageController;