const {Client, Dietitian, Notification, NutritionAssignment, NutritionPlan} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const {CLIENT} = require("../Enum/Role");
const {Op} = require("sequelize");

class ClientService {
    async login(phoneNumber, password) {
        try {
            const client = await Client.findOne({
                where: {
                    phoneNumber: phoneNumber,
                    password: password
                }
            });

            if (!client) {
                throw new Exception('Hatalı giriş bilgileri.', 400, true);
            }

            const token = jwt.sign(
                {
                    id: client.id,
                    dietitian_id: client.dietitian_id,
                    role: client.role,
                    phoneNumber: client.phoneNumber,
                },
                config.secretkey,
                { expiresIn: '24h' }
            );

            await client.update({ token });

            return {
                ...client.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async register(dietitian_id, name, phoneNumber, password, ipAddress) {
        try {
            if (!dietitian_id) {
                throw new Exception('Diyetisyen bulunamadı.', 400, true);
            }

            if (!phoneNumber || !name || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const client = await Client.create({
                dietitian_id: dietitian_id,
                name: name,
                phoneNumber: phoneNumber,
                password: password,
                role: CLIENT,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    client_id: client.id,
                    dietitian_id: client.dietitian_id,
                    phoneNumber: client.phoneNumber,
                    role: CLIENT
                },
                config.secretkey
            );

            await client.update({ token });

            return {
                ...client.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getClientInfo(user_id) {
        try {
            if (!user_id) {
                throw new Error("Yetkisiz Erişim.");
            }

            const client = await Client.findOne({
                where: { id: user_id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            });

            if (!client) {
                throw new Error("Diyetisyen bulunamadı.");
            }

            return client;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getMyNotifications(phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new Error("Yetkisiz Erişim.");
            }

            const notifications = await Notification.findAll({
                where: { phoneNumber: phoneNumber }
            });

            if (!notifications || notifications.length === 0) {
                throw new Error("Bildiriminiz yok.");
            }

            return notifications;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async readMyAllNotifications(phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new Error("Yetkisiz Erişim.");
            }

            const [affectedRows] = await Notification.update(
                { isRead: true },
                {
                    where: { phoneNumber: phoneNumber, isRead: false }
                }
            );

            if (affectedRows === 0) {
                throw new Error("Okunmamış bildiriminiz yok.");
            }

            return {
                message: "Basarili"
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getTodayMeal(clientId, todayDate, dayName) {
        const assignment = await NutritionAssignment.findOne({
            where: {
                client_id: clientId,
                start_date: { [Op.lte]: todayDate },
                end_date: { [Op.gte]: todayDate }
            },
            include: [
                {
                    model: NutritionPlan,
                    as: 'NutritionPlan'
                }
            ]
        });

        if (!assignment) {
            throw new Exception("Bugün için atanmış bir beslenme planı bulunamadı. Lütfen diyetisyeninizden size bir beslenme programı atamasını talep edin.", 404, true);
        }

        const mealPlan = assignment.NutritionPlan.mealPlan;
        const todayMeal = mealPlan?.[dayName];

        if (!todayMeal) {
            throw new Exception(`Plan var ancak ${dayName} için bir öğün bulunamadı.`, 404, true);
        }

        return todayMeal;
    }
}

module.exports = new ClientService();