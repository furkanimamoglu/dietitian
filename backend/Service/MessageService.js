const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {Message} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {DIETITIAN, CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));

class MessageService {

    static async getMyMessages(user_id, user_role, partner_id) {
        if (!user_id || !user_role) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (user_role === DIETITIAN) {
            return await Message.findAll({
                where: {dietitian_id: user_id, client_id: partner_id},
                order: [['createdAt', 'ASC']]
            });
        } else if (user_role === CLIENT) {
            return await Message.findAll({
                where: {client_id: user_id},
                order: [['createdAt', 'ASC']]
            });
        } else {
            throw Exception("Yetkisiz Erişim", 401, true);
        }
    }

    static async getMyUnreadMessageCount(user_id, user_role, partner_id) {
        if (!user_id || !user_role) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (user_role === DIETITIAN && partner_id) {
            return await Message.count({
                where: {dietitian_id: user_id, client_id: partner_id, sender: CLIENT, isRead: false},
                order: [['createdAt', 'ASC']]
            });
        } else if (user_role === DIETITIAN && !partner_id) {
            return await Message.count({
                where: {dietitian_id: user_id, sender: CLIENT, isRead: false},
            })
        } else if (user_role === CLIENT) {
            return await Message.count({
                where: {client_id: user_id, sender: DIETITIAN, isRead: false},
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
            throw Exception("Message Sending failed.", 401, true);
        }
    }

    static async changeMessageStatusToReaded(user_id, partner_id, user_role) {
        try {
            let dietitian_id, client_id, sender_role;

            if (user_role === DIETITIAN) {
                dietitian_id = user_id;
                client_id = partner_id;
                sender_role = CLIENT;
            } else if (user_role === CLIENT) {
                client_id = user_id;
                sender_role = DIETITIAN;
            } else {
                throw new Exception('Geçersiz kullanıcı rolü.', 400, true);
            }

            const [updatedCount] = await Message.update(
                {isRead: true},
                {
                    where: {
                        dietitian_id,
                        client_id,
                        sender: sender_role,
                        isRead: false
                    }
                }
            );

            return {updated: updatedCount};
        } catch (err) {
            throw Exception("Message Reading Notify failed.", 401, true);
        }
    }

}

module.exports = MessageService;
