const path = require('path');
const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const Appointment = require(path.join(__dirname, '..', 'Model', 'Appointment'));
const Client = require(path.join(__dirname, '..', 'Model', 'Client'));
const {Op} = require('sequelize');

class AppointmentService {
    static async fetchDietitianAppointments(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            return await Appointment.findAll({
                where: {dietitian_id: user_id},
                include: [
                    {
                        model: Client,
                        attributes: ['id', 'email', 'phoneNumber'],
                    },
                ],
            });
        } catch (error) {
            throw new Exception(error.message, error.status || 500);
        }
    }

    static async fetchClientAppointmentAsDietitian(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!client_id) {
            throw new Exception("Danışan belirtilmedi.", 404, true);
        }

        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Bu danışan size ait değil veya bulunamadı.", 403, true);
        }

        return await Appointment.findAll({
            where: {
                client_id: client_id
            },
            order: [['start', 'DESC']]
        });
    }


    static async addAppointment(data) {
        const {title, start, end, client_id} = data;

        const client = await Client.findByPk(client_id);
        if (!client) {
            throw new Exception("Kullanıcı bulunamadı.", 404);
        }

        const dietitian_id = client.dietitian_id;

        try {
            if (!title || !start || !end || !dietitian_id || !client_id) {
                throw new Exception("Tüm alanları doldurmanız gerekmektedir.");
            }

            return await Appointment.create({
                title,
                start,
                end,
                dietitian_id,
                client_id,
            });

        } catch (error) {
            throw new Exception(error.message || "Randevu oluşturulurken bir hata meydana geldi.");
        }
    }

    static async updateAppointment(appointment_id, data) {
        const {title, start, end, dietitian_id, client_id, status} = data;

        try {
            if (!appointment_id || !title || !start || !end || !dietitian_id || !client_id || !status) {
                throw new Exception("Tüm alanları doldurmanız gerekmektedir.");
            }

            const existingAppointment = await Appointment.findByPk(appointment_id);
            if (!existingAppointment) {
                throw new Exception("Güncellemek istediğiniz randevu bulunamadı.");
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
            throw new Exception(error.message || "Randevu güncellenirken bir hata meydana geldi.");
        }
    }

    static async fetchClientAppointments(client_id) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const appointments = await Appointment.findAll({
                where: {client_id: client_id},
                order: [['start', 'ASC']]
            });

            if (!appointments || appointments.length === 0) {
                throw new Exception("Şu anda herhangi bir randevu bulunmamaktadır.");
            }

            return appointments;
        } catch (error) {
            throw new Exception(error.message, error.status || 500);
        }
    }


    static async approveAppointment(appointment_id, dietitian_id) {
        try {
            if (!appointment_id || !dietitian_id) {
                throw new Exception("Geçersiz randevu veya diyetisyen bilgisi.");
            }

            const appointment = await Appointment.findOne({
                where: {
                    id: appointment_id,
                    dietitian_id: dietitian_id
                }
            });

            if (!appointment) {
                throw new Exception("Randevu bulunamadı veya bu randevuyu onaylama yetkiniz yok.");
            }

            await appointment.update({
                status: "approved"
            });

            return appointment;
        } catch (error) {
            throw new Exception(error.message || "Randevu onaylanırken bir hata meydana geldi.");
        }
    }

    static async getTodayAppointmentCount(dietitian_id) {
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

        return {count};
    }

    static async getRemainingTodayAppointmentCount(dietitian_id) {
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

        return {count};
    }

    static async getPendingAppointmentCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const count = await Appointment.count({
            where: {
                dietitian_id,
                status: 'pending'
            }
        });

        return {count};
    }

    static async updateAppointmentStatus(dietitian_id, appointment_id, action) {
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

        if (action !== 'approved' && action !== 'cancelled') {
            throw new Exception("Geçersiz işlem türü.", 400, true);
        }

        appointment.status = action;
        await appointment.save();

        return {
            success: true,
            message: `Randevu ${action === 'approved' ? 'onaylandı' : 'reddedildi'}.`
        };
    }

    static async getPendingAppointments(dietitian_id) {
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

    static async getTodayApprovedAppointments(dietitian_id) {
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

    static async deleteAppointment(dietitian_id, appointment_id) {
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

        return {success: true};
    }

    static async deleteAppointmentAsClient(client_id, appointment_id) {
        if (!client_id || !appointment_id) {
            throw {
                status: 400,
                message: "Diyetisyen ID ve randevu ID gereklidir."
            };
        }

        const appointment = await Appointment.findOne({
            where: {
                id: appointment_id,
                client_id: client_id
            }
        });

        if (!appointment) {
            throw {
                status: 404,
                message: "Bu randevu bulunamadı veya size ait değil."
            };
        }

        await appointment.destroy();

        return {success: true};
    }

}

module.exports = AppointmentService;