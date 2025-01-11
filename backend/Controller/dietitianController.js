const DietitianService = require("../Service/dietitianService");
require("../Exception/Exception");
const Security = require("../Utils/Security");

class DietitianController {

    async login(req, res) {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const dietitian = await DietitianService.login(email, password);

            res.status(200).json({
                email: dietitian.email,
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
                    message: 'Tüm parametreler doldurulmalıdır.'
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
            const token = req.headers.authorization;
            const user_id = await Security.getUserIdFromToken(token);

            if (!token) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            if (!email || !password || !phoneNumber) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.registerClient(user_id, email, password, phoneNumber, name, surname);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    async deleteClient(req, res) {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Yetkisiz erişim."
            });
        }

        try {
            const {client_id} = req.body;

            if (!client_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.deleteClient(token, client_id);

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
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const result = await DietitianService.getMyAllClients(token)
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
