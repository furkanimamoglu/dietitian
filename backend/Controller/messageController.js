const path = require("path");

const MessageService = require(path.join(__dirname, "..", "Service", "MessageService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));

class messageController {

    static async getMyMessages(req, res) {
        try {
            const user_id = req.user.id;
            const user_role = req.user.role;

            const {partner_id} = req.query;

            const result = await MessageService.getMyMessages(user_id, user_role, partner_id);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getMyUnreadMessageCount(req, res) {
        try {
            const user_id = req.user.id;
            const user_role = req.user.role;

            const {partner_id} = req.query;

            const result = {
                unreadMessageCount: await MessageService.getMyUnreadMessageCount(user_id, user_role, partner_id)
            };

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async changeMessageStatusToReaded(req, res) {
        try {
            const user_id = req.user.id;
            const user_role = req.user.role;

            const {partner_id} = req.query;

            const result = await MessageService.changeMessageStatusToReaded(user_id, partner_id, user_role);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async sendMessage(req, res) {
        try {
            const sender_id = req.user.id;
            const sender_role = req.user.role;

            const {receiver_id, message} = req.body;

            const result = await MessageService.sendMessage(receiver_id, sender_id, sender_role, message);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = messageController;