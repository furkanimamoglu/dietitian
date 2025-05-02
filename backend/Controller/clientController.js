const ClientService = require("../Service/clientService");

class ClientController {

    async login(req, res) {
        try {
            const {email, password} = req.body;

            const client = await ClientService.login(email, password);

            res.status(200).json(
                {
                    email: client.email,
                    token: client.token,
                }
            );
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = new ClientController();