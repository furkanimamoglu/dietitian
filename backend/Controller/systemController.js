const systemService = require('../Service/systemService');
const Exception = require('../Exception/Exception');

class SystemController {

    settings(req, res) {
        return res.status(200).json(
            systemService.bringWebSettings()
        );
    }

    backup(req, res) {
        try {
            systemService.backup();
            return res.status(200).json({
                message: 'Successfully Backup',
            });
        } catch (error) {
            throw new Exception(error.message);
        }
    }
}

module.exports = new SystemController();