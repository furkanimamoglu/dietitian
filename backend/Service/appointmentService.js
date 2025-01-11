const Exception = require("../Exception/Exception");
const Security = require("../Utils/Security");
const Appointment = require('../Model/Appointment');
const Client = require('../Model/Client');

class AppointmentService {
    async getDietitianAppointments(token) {
        try {
            const user_id = Security.getUserIdFromToken(token);

            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const appointments = await Appointment.findAll({
                where: { dietitian_id: user_id },
                include: [
                    {
                        model: Client,
                        attributes: ['id', 'email', 'phoneNumber'],
                    },
                ],
            });

            if (!appointments || appointments.length === 0) {
                throw new Exception("Şu anda herhangi bir randevu bulunmamaktadır.", 404);
            }

            return appointments;
        } catch (error) {
            throw new Exception(error.message, error.status || 500);
        }
    }
}

module.exports = new AppointmentService();
