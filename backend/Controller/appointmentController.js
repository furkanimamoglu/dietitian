const AppointmentService = require("../Service/AppointmentService");
const Security = require("../Utils/Security");

class AppointmentController {

    async fetchDietitianAppointments(req, res) {
        try {
            // Authentication Module
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const user_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getDietitianAppointments(user_id);
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

    async addAppointmentAsDietitian(req, res) {
        try {
            // Authentication Module
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }
            const user_id = Security.getUserIdFromToken(token);

            const { title, start, end, client_id } = req.body;

            if (!title || !start || !end || !client_id) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const newAppointment = await AppointmentService.addAppointment({
                title,
                start,
                end,
                dietitian_id: user_id,
                client_id,
            });

            res.status(201).json({
                appointment: newAppointment,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

}

module.exports = new AppointmentController();