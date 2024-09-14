// Imports
const DietitianService = require("../Service/dietitianService");
const error = require("../Exception/Exception");

exports.login = async (req,res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password){
            return res.status(400).json({
                showOnScreen: true,
                message: 'All parameters must be filled.'
            });
        }

        const dietitian = await DietitianService.login(username, password);

        res.status(200).json(
            {
                username: dietitian.username,
                token: dietitian.token,
                role: dietitian.role
            }
        );
    } catch (error) {
        res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        })
    }
}

exports.register = async (req,res) => {
    try {
        const { username, password, email} = req.body;
        const ipAddress = req.ip;

        if(!username || !password || !email || !ipAddress){
           return res.status(400).json({
                    showOnScreen: true,
                    message: 'All parameters must be filled.'
           });
        }

        const result = await DietitianService.register(username, password, email, ipAddress);

        return res.status(200).json({
            username: result.username,
            role: result.role,
            token: result.token
        });
    } catch (error) {
        res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        });
    }
};

// Dietitian's Client Operations
exports.registerClient = async (req,res) => {
    try {
        const { username, password, email, phoneNumber, name, surname } = req.body;

        if(!username || !password || !email || !phoneNumber){
            return res.status(400).json({
                showOnScreen: true,
                message: 'All parameters must be filled.'
            });
        }

        const result = await DietitianService.registerClient(username, password, email, phoneNumber, name, surname);

        res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        });
    }
}

exports.getMyClients = async (req,res) => {
    try {
        const { username, password, email, phoneNumber, name, surname } = req.body;

        if(!username || !password || !email || !phoneNumber){
            return res.status(400).json({
                showOnScreen: true,
                message: 'All parameters must be filled.'
            });
        }

        const result = await DietitianService.registerClient(username, password, email, phoneNumber, name, surname);

        res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        });
    }
}

exports.deleteClient = async (req,res) => {
    try {
        const { clientUsername } = req.body;

        if(!clientUsername){
            return res.status(400).json({
                showOnScreen: true,
                message: 'All parameters must be filled.'
            });
        }

        const result = await DietitianService.deleteClient(clientUsername);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        });
    }
}
