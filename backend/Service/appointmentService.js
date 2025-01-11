const Exception = require("../Exception/Exception");
const Appointment = require('../Model/Appointment');
const Client = require('../Model/Client');
const {Op} = require("sequelize");

class AppointmentService {
    async getDietitianAppointments(user_id) {
        try {
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

    async addAppointment(data) {
        const { title, startTime, endTime, dietitian_id, client_id } = data;

        try {
            if (!title || !startTime || !endTime || !dietitian_id || !client_id) {
                throw new Error("Tüm alanları doldurmanız gerekmektedir.");
            }

            // Hata kontrolü: Randevunun zaman uyuşmazlığı
            const conflictingAppointments = await Appointment.findOne({
                where: {
                    dietitian_id: dietitian_id,
                    [Op.or]: [
                        {
                            startTime: {
                                [Op.between]: [startTime, endTime],
                            },
                        },
                        {
                            endTime: {
                                [Op.between]: [startTime, endTime],
                            },
                        },
                        {
                            [Op.and]: [
                                { startTime: { [Op.lte]: startTime } },
                                { endTime: { [Op.gte]: endTime } },
                            ],
                        },
                    ],
                },
            });

            if (conflictingAppointments) {
                throw new Error("Bu zaman aralığında başka bir randevu bulunmaktadır.");
            }

            // Yeni randevu oluştur
            return await Appointment.create({
                title,
                startTime,
                endTime,
                dietitian_id,
                client_id,
            });
        } catch (error) {
            throw new Error(error.message || "Randevu oluşturulurken bir hata meydana geldi.");
        }
    }
}

module.exports = new AppointmentService();
