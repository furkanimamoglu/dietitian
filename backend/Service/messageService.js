const Exception = require("../Exception/Exception");
const {Message} = require("../Model/MainModel");
const {DIETITIAN, CLIENT} = require("../Enum/Role");

class MessageService {

    static async getMyMessages(user_id, user_role, partner_id) {
        if (!user_id || !user_role) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (user_role === DIETITIAN) {
            return await Message.findAll({
                where: {dietitian_id: user_id, client_id: partner_id, sender: user_role},
                order: [['createdAt', 'ASC']]
            });
        } else if (user_role === CLIENT) {
            return await Message.findAll({
                where: {client_id: user_id, dietitian_id: partner_id, sender: user_role},
                order: [['createdAt', 'ASC']]
            });
        } else {
            throw Exception("Yetkisiz Erişim", 401, true);
        }
    }

    static async sendMessage(receiver_id, sender_id, sender_role, message) {
        try {
            let dietitian_id, client_id;

            if (sender_role === DIETITIAN) {
                dietitian_id = sender_id;
                client_id = receiver_id;
            } else if (sender_role === CLIENT) {
                dietitian_id = receiver_id;
                client_id = sender_id;
            } else {
                throw new Exception('Hatalı gönderen rolü tanımlandı.', 400, true);
            }

            return await Message.create({
                dietitian_id,
                client_id,
                sender: sender_role,
                message
            });
        } catch (err) {
            console.error('Message sending failed:', err);
            throw err;
        }
    }

}

module.exports = MessageService;
