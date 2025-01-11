const AppointmentService = require("../Service/AppointmentService");

class AppointmentController {

    async fetchDietitianAppointments(req, res) {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await AppointmentService.getDietitianAppointments(token);
            res.status(200).json(
                {
                    appointment: result
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

module.exports = new AppointmentController();