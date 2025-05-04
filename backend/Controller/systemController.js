const systemService = require('../Service/systemService');
const Exception = require('../Exception/Exception');

class SystemController {

    settings(req, res) {
        return res.status(200).json(
            systemService.bringWebSettings()
        );
    }
}

module.exports = new SystemController();