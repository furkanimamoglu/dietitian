const MessageService = require("../Service/messageService");
const Security = require("../Utils/Security");

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

            const result = await MessageService.getMyMessages(user_id, user_role);

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