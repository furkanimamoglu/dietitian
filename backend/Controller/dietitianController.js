// Imports
const DietitianService = require("../Service/dietitianService");
const error = require("../Exception/Exception");

class DietitianController {

    async login(req, res) {
        try {
            const {username, password} = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'All parameters must be filled.'
                });
            }

            const dietitian = await DietitianService.login(username, password);

            res.status(200).json({
                username: dietitian.username,
                token: dietitian.token,
                role: dietitian.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async register(req, res) {
        try {
            const {email, password} = req.body;
            const ipAddress = req.ip;

            if (!email || !password || !ipAddress) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'All parameters must be filled.'
                });
            }

            const result = await DietitianService.register(email, password, ipAddress);

            res.status(200).json({
                username: result.username,
                role: result.role,
                token: result.token
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async registerClient(req, res) {
        try {
            const {email, password, phoneNumber, name, surname} = req.body;

            if (!email || !password || !phoneNumber) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'All parameters must be filled.'
                });
            }

            const result = await DietitianService.registerClient(email, password, phoneNumber, name, surname);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async deleteClient(req, res) {
        try {
            const {clientUsername} = req.body;

            if (!clientUsername) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'All parameters must be filled.'
                });
            }

            const result = await DietitianService.deleteClient(clientUsername);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async getAllMyClients(req, res) {
        try {
            const result = await DietitianService.getMyAllClients(1)
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

}

module.exports = new DietitianController();
