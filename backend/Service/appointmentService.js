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
        const { title, start, end, dietitian_id, client_id } = data;

        try {
            if (!title || !start || !end || !dietitian_id || !client_id) {
                throw new Error("Tüm alanları doldurmanız gerekmektedir.");
            }

            const conflictingAppointments = await Appointment.findOne({
                where: {
                    dietitian_id: dietitian_id,
                    [Op.or]: [
                        {
                            start: {
                                [Op.between]: [start, end],
                            },
                        },
                        {
                            end: {
                                [Op.between]: [start, end],
                            },
                        },
                        {
                            [Op.and]: [
                                { start: { [Op.lte]: start } },
                                { end: { [Op.gte]: end } },
                            ],
                        },
                    ],
                },
            });

            if (conflictingAppointments) {
                throw new Error("Bu zaman aralığında başka bir randevu bulunmaktadır.");
            }

            return await Appointment.create({
                title,
                start,
                end,
                dietitian_id,
                client_id,
            });
        } catch (error) {
            throw new Error(error.message || "Randevu oluşturulurken bir hata meydana geldi.");
        }
    }

    async updateAppointment(appointment_id, data) {
        const { title, start, end, dietitian_id, client_id } = data;

        try {
            if (!appointment_id || !title || !start || !end || !dietitian_id || !client_id) {
                throw new Error("Tüm alanları doldurmanız gerekmektedir.");
            }

            const existingAppointment = await Appointment.findByPk(appointment_id);
            if (!existingAppointment) {
                throw new Error("Güncellemek istediğiniz randevu bulunamadı.");
            }

            const conflictingAppointments = await Appointment.findOne({
                where: {
                    id: { [Op.ne]: appointment_id },
                    dietitian_id: dietitian_id,
                    [Op.or]: [
                        {
                            start: {
                                [Op.between]: [start, end],
                            },
                        },
                        {
                            end: {
                                [Op.between]: [start, end],
                            },
                        },
                        {
                            [Op.and]: [
                                { start: { [Op.lte]: start } },
                                { end: { [Op.gte]: end } },
                            ],
                        },
                    ],
                },
            });

            if (conflictingAppointments) {
                throw new Error("Bu zaman aralığında başka bir randevu bulunmaktadır.");
            }

            await existingAppointment.update({
                title,
                start,
                end,
                dietitian_id,
                client_id,
            });

            return existingAppointment;
        } catch (error) {
            throw new Error(error.message || "Randevu güncellenirken bir hata meydana geldi.");
        }
    }
}

module.exports = new AppointmentService();
