const utilService = require('../Service/utilService');

class utilController {

    async getUserRole(req, res) {
        try {
            const token = req.headers.authorization;
            const result = await utilService.getUserRole(token);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

}

module.exports = new utilController();
