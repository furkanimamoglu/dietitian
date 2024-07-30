const ClientService = require("../Service/clientService");

exports.login = async (req,res) => {
    try {
        const { username, password } = req.body;

        const client = await ClientService.login(username, password);

        res.status(200).json(
            {
                username: client.username,
                token: client.token,
                role: client.role
            }
        );
    } catch (error) {
        res.status(error.status || 500).json({
            showOnScreen: error.showOnScreen,
            message: error.message
        })
    }
}