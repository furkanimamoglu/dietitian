const AppointmentService = require("../Service/appointmentService");
const Security = require("../Utils/Security");

class AppointmentController {

    async fetchDietitianAppointments(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

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
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

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

    async updateAppointmentAsDietitian(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const { appointment_id, title, start, end, client_id } = req.body;

            if (!appointment_id || !title || !start || !end || !client_id) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const updatedAppointment = await AppointmentService.updateAppointment(appointment_id, {
                title,
                start,
                end,
                dietitian_id: user_id,
                client_id,
            });

            res.status(200).json({
                appointment: updatedAppointment,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    async fetchClientAppointments(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await AppointmentService.getClientAppointments(user_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    async approveAppointmentAsDietitian(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const { appointment_id } = req.body;

            if (!appointment_id) {
                return res.status(400).json({
                    message: "Randevu ID'si gereklidir."
                });
            }

            const updatedAppointment = await AppointmentService.approveAppointment(appointment_id, user_id);

            res.status(200).json({
                appointment: updatedAppointment,
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