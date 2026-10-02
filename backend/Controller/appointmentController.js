const path = require("path");

const AppointmentService = require(path.join(__dirname, "..", "Service", "AppointmentService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));

class AppointmentController {

    static async fetchDietitianAppointments(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.fetchDietitianAppointments(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async fetchClientAppointmentAsDietitian(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const result = await AppointmentService.fetchClientAppointmentAsDietitian(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addAppointmentAsDietitian(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {note, start, end, client_id} = req.body;

            if (!start || !end || !client_id) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const newAppointment = await AppointmentService.addAppointment({
                note,
                start,
                end,
                dietitian_id,
                client_id,
            });

            res.status(201).json(newAppointment);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    static async updateAppointmentAsDietitian(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {appointment_id, note, start, end, client_id, status} = req.body;

            if (!appointment_id || !start || !end || !client_id || !status) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const updatedAppointment = await AppointmentService.updateAppointment(appointment_id, {
                note,
                start,
                end,
                dietitian_id,
                client_id,
                status,
            });

            res.status(200).json({
                appointment: updatedAppointment,
            });
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    static async fetchClientAppointments(req, res) {
        try {
            const client_id = req.user.id;

            const result = await AppointmentService.fetchClientAppointments(client_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async deleteAppointmentAsDietitian(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {appointment_id} = req.query;

            if (!appointment_id) {
                return res.status(400).json({
                    message: "Randevu ID'si gerekli."
                });
            }

            await AppointmentService.deleteAppointment(dietitian_id, appointment_id);

            res.status(200).json({
                message: "Randevu başarıyla silindi."
            });

        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    static async deleteAppointmentAsClient(req, res) {
        try {
            const client_id = req.user.id;

            const {appointment_id} = req.query;

            if (!appointment_id) {
                return res.status(400).json({
                    message: "Randevu ID'si gerekli."
                });
            }

            await AppointmentService.deleteAppointmentAsClient(client_id, appointment_id);

            res.status(200).json({
                message: "Randevu başarıyla silindi."
            });

        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    static async addAppointmentAsClient(req, res) {
        try {
            const client_id = req.user.id;

            const {note, start, end} = req.body;

            if (!start || !end) {
                return res.status(400).json({
                    message: "Tüm alanları doldurmanız gerekmektedir."
                });
            }

            const newAppointment = await AppointmentService.addAppointment({
                note,
                start,
                end,
                client_id,
            });

            res.status(201).json({
                appointment: newAppointment,
            });
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: true,
                message: error.message,
            });
        }
    }

    static async getTodayAppointmentCount(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.getTodayAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getRemainingTodayAppointmentCount(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.getRemainingTodayAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getPendingAppointmentCount(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.getPendingAppointmentCount(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async updateAppointmentStatus(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {appointment_id, action} = req.body;

            if (!appointment_id || !action) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "appointment_id ve action zorunludur."
                });
            }

            const result = await AppointmentService.updateAppointmentStatus(dietitian_id, appointment_id, action);

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getPendingAppointments(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.getPendingAppointments(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getTodayApprovedAppointments(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await AppointmentService.getTodayApprovedAppointments(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

}

module.exports = AppointmentController;