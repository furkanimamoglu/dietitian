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
        const { title, start, end, client_id } = data;

        const Client = require("../Model/Client");
        const client = await Client.findByPk(client_id);
        if (!client) {
            throw new Exception("Kullanıcı bulunamadı.", 404);
        }

        const dietitian_id = client.dietitian_id;

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
        const { title, start, end, dietitian_id, client_id, status } = data;

        try {
            if (!appointment_id || !title || !start || !end || !dietitian_id || !client_id || !status) {
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
                status,
            });

            return existingAppointment;
        } catch (error) {
            throw new Error(error.message || "Randevu güncellenirken bir hata meydana geldi.");
        }
    }

    async getClientAppointments(client_id) {
        try {
            if (!client_id) {
                throw new Error("Yetkisiz Erişim.");
            }

            const appointments = await Appointment.findAll({
                where: { client_id: client_id }
            });

            if (!appointments || appointments.length === 0) {
                throw new Error("Şu anda herhangi bir randevu bulunmamaktadır.");
            }

            return appointments;
        } catch (error) {
            throw new Exception(error.message, error.status || 500);
        }
    }

    async approveAppointment(appointment_id, dietitian_id) {
        try {
            if (!appointment_id || !dietitian_id) {
                throw new Error("Geçersiz randevu veya diyetisyen bilgisi.");
            }

            const appointment = await Appointment.findOne({
                where: {
                    id: appointment_id,
                    dietitian_id: dietitian_id
                }
            });

            if (!appointment) {
                throw new Error("Randevu bulunamadı veya bu randevuyu onaylama yetkiniz yok.");
            }

            await appointment.update({
                status: "approved"
            });

            return appointment;
        } catch (error) {
            throw new Error(error.message || "Randevu onaylanırken bir hata meydana geldi.");
        }
    }

    async getTodayAppointmentCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const count = await Appointment.count({
            where: {
                dietitian_id,
                start: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        return { count };
    }

    async getRemainingTodayAppointmentCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const count = await Appointment.count({
            where: {
                dietitian_id,
                start: {
                    [Op.between]: [now, endOfDay]
                }
            }
        });

        return { count };
    }

    async getPendingAppointmentCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const count = await Appointment.count({
            where: {
                dietitian_id,
                status: 'pending'
            }
        });

        return { count };
    }

    async updateAppointmentStatus(dietitian_id, appointment_id, action) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const appointment = await Appointment.findOne({
            where: {
                id: appointment_id,
                dietitian_id
            }
        });

        if (!appointment) {
            throw new Exception("Bu randevu size ait değil veya bulunamadı.", 404, true);
        }

        if (appointment.status !== 'pending') {
            throw new Exception("Bu randevu zaten değerlendirilmiş.", 400, true);
        }

        if (!['approved', 'denied'].includes(action)) {
            throw new Exception("Geçersiz işlem türü.", 400, true);
        }

        appointment.status = action;
        await appointment.save();

        return {
            success: true,
            message: `Randevu ${action === 'approved' ? 'onaylandı' : 'reddedildi'}.`
        };
    }

    async getPendingAppointments(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        return await Appointment.findAll({
            where: {
                dietitian_id,
                status: 'pending'
            },
            include: [
                {
                    model: Client,
                    attributes: ['id', 'name', 'phoneNumber']
                }
            ],
            order: [['start', 'ASC']]
        });
    }

    async getTodayApprovedAppointments(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        return await Appointment.findAll({
            where: {
                dietitian_id,
                status: "approved",
                start: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: [
                {
                    model: Client,
                    attributes: ['id', 'name', 'phoneNumber']
                }
            ],
            order: [['start', 'ASC']]
        });
    }

    async deleteAppointment(dietitian_id, appointment_id) {
        if (!dietitian_id || !appointment_id) {
            throw {
                status: 400,
                message: "Diyetisyen ID ve randevu ID gereklidir."
            };
        }

        const appointment = await Appointment.findOne({
            where: {
                id: appointment_id,
                dietitian_id: dietitian_id
            }
        });

        if (!appointment) {
            throw {
                status: 404,
                message: "Bu randevu bulunamadı veya size ait değil."
            };
        }

        await appointment.destroy();

        return { success: true };
    }

}

module.exports = new AppointmentService();
