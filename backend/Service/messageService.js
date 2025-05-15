const Exception = require("../Exception/Exception");
const {Message} = require("../Model/MainModel");

class MessageService {
    // Dietitian
    static async getMyMessagesAsDietitian(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Message.findAll({
            where: { dietitian_id }
        });
    }

    // Client
    static async getMyMessagesAsClient(client_id) {
        if (!client_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Message.findAll({
            where: { client_id }
        });
    }

}

module.exports = MessageService;
