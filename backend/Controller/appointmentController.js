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
            res.status(200).json(result);
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

            res.status(201).json(newAppointment);
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

            const { appointment_id, title, start, end, client_id, status } = req.body;

            if (!appointment_id || !title || !start || !end || !client_id || !status) {
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
                status,
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

    async deleteAppointmentAsDietitian(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const { appointment_id } = req.params;

            if (!appointment_id) {
                return res.status(400).json({
                    message: "Randevu ID'si gerekli."
                });
            }

            await AppointmentService.deleteAppointment(dietitian_id,appointment_id);

            res.status(200).json({
                message: "Randevu başarıyla silindi."
            });

        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    async addAppointmentAsClient(req, res) {
        try {
            const token = req.headers.authorization;
            const user_id = Security.getUserIdFromToken(token);
            if (!token || !user_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const { title, start, end } = req.body;

            if (!title || !start || !end) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const newAppointment = await AppointmentService.addAppointment({
                title,
                start,
                end,
                client_id: user_id,
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

    async getTodayAppointmentCount(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getTodayAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async getRemainingTodayAppointmentCount(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getRemainingTodayAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async getPendingAppointmentCount(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getPendingAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async updateAppointmentStatus(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const { appointment_id, action } = req.body;

            if (!appointment_id || !action) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "appointment_id ve action zorunludur."
                });
            }

            const result = await AppointmentService.updateAppointmentStatus(dietitian_id, appointment_id, action);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async getPendingAppointments(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getPendingAppointments(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    async getTodayApprovedAppointments(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            const result = await AppointmentService.getTodayApprovedAppointments(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

}

module.exports = new AppointmentController();