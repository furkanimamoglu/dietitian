const Exception = require("../Exception/Exception");
const {Message} = require("../Model/MainModel");
const {DIETITIAN, CLIENT} = require("../Enum/Role");

class MessageService {

    static async getMyMessages(user_id, user_role) {
        if (!user_id || !user_role) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (user_role === DIETITIAN) {
            return await Message.findAll({
                where: {dietitian_id: user_id, sender: user_role},
                order: [['createdAt', 'ASC']]
            });
        } else if (user_role === CLIENT) {
            return await Message.findAll({
                where: {client_id: user_id, sender: user_role},
                order: [['createdAt', 'ASC']]
            });
        } else {
            throw Exception("Yetkisiz Erişim", 401, true);
        }
    }

}

module.exports = MessageService;
