const path = require('path');
const {logger, serializeError} = require(path.join(__dirname, '..', 'Utils', 'Logger'));

const {
    Client,
    ExerciseAssignment,
    Notification,
    NutritionAssignment,
    NutritionPlan,
    Measurement,
    RecipeAssignment,
    Recipe,
    RecipeCategory
} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const jwt = require('jsonwebtoken');
const config = require(path.join(__dirname, '..', 'Utils', 'Config'));
const {CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));
const {Op} = require('sequelize');

class ClientService {
    static async login(phoneNumber, password) {
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

            if (client.status === 'Pasif') {
                throw new Exception('Hesabınız diyetisyeniniz tarafından pasif duruma getirilmiş. Lütfen diyetisyeninizle iletişime geçin.', 403, true);
            }

            const token = jwt.sign(
                {
                    id: client.id,
                    dietitian_id: client.dietitian_id,
                    role: client.role,
                    phoneNumber: client.phoneNumber,
                },
                config.secretkey,
                {expiresIn: '30d'}
            );

            await client.update({token});

            return {
                ...client.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async register(dietitian_id, name, gender, phoneNumber, password, ipAddress) {
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
                gender: gender,
                phoneNumber: phoneNumber,
                password: password,
                role: CLIENT,
                status: 'Pasif',
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    id: client.id,
                    dietitian_id: client.dietitian_id,
                    phoneNumber: client.phoneNumber,
                    role: CLIENT
                },
                config.secretkey,
                {expiresIn: '30d'}
            );

            await client.update({token});

            return {
                ...client.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async getClientInfo(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const client = await Client.findOne({
                where: {id: user_id},
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            });

            if (!client) {
                throw new Exception("Diyetisyen bulunamadı.");
            }

            return client;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async readMyAllNotifications(client_id) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const [affectedRows] = await Notification.update(
                {isRead: true},
                {
                    where: {client_id: client_id, isRead: false}
                }
            );

            if (affectedRows === 0) {
                throw new Exception("Okunmamış bildiriminiz yok.");
            }

            return {
                message: "Basarili"
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async getMyLatestMeasurement(client_id) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const measurement = await Measurement.findOne({
                where: {client_id},
                order: [['createdAt', 'DESC']]
            });

            if (!measurement) {
                throw new Exception("Ölçüm verisi bulunamadı.");
            }

            return measurement;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async getTodayMealPlan(clientId, todayDate) {
        const assignment = await NutritionAssignment.findOne({
            where: {
                client_id: clientId,
                start_date: {[Op.lte]: todayDate},
                end_date: {[Op.gte]: todayDate}
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

        return assignment;
    }

    static async getMyRecipes(client_id) {
        if (!client_id) {
            throw new Exception("Yetkisiz Erişim.", 400, true);
        }

        const recipes = await RecipeAssignment.findAll({
            where: {client_id: client_id},
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Recipe,
                    as: 'Recipe',
                    include: [
                        {
                            model: RecipeCategory,
                            as: 'category'
                        }
                    ]
                }
            ]
        });

        if (!recipes || recipes.length === 0) {
            throw new Exception("Kayıtlı tarifiniz bulunamadı.", 404, true);
        }

        return recipes;
    }

    static async updateMealPlan(client_id, nutrition_assignment_id, newMealPlan) {
        const assignment = await NutritionAssignment.findOne({
            where: {
                client_id: client_id,
                id: nutrition_assignment_id
            }
        });

        if (!assignment) {
            throw new Exception("Belirtilen kullanıcıya ait beslenme ataması bulunamadı.", 404, true);
        }

        if (newMealPlan) {
            Object.keys(newMealPlan).forEach(day => {
                if (!newMealPlan[day]) return;

                Object.keys(newMealPlan[day]).forEach(mealType => {
                    const meals = newMealPlan[day][mealType];

                    if (Array.isArray(meals) && meals.length > 0) {
                        if (!meals.every(meal => meal.hasOwnProperty('isim') && meal.hasOwnProperty('yenildi'))) {
                            newMealPlan[day][mealType] = meals.map(meal => {
                                if (typeof meal === 'string') {
                                    return {isim: meal, yenildi: false};
                                } else if (typeof meal === 'object' && !meal.hasOwnProperty('isim')) {
                                    const key = Object.keys(meal)[0] || '';
                                    return {isim: key || meal.toString(), yenildi: false};
                                }
                                return meal;
                            });
                        }
                    }
                });
            });
        }

        assignment.mealPlan = newMealPlan;
        await assignment.save();

        return assignment;
    }

    static async getMyApprovalStatus(client_id) {
        try {
            const client = await Client.findOne({
                where: {id: client_id},
                attributes: ['kvkkApproval', 'kullaniciSozlesmesiApproval', 'SMSApproval', 'MailApproval', 'NotificationApproval']
            });

            if (!client) {
                throw new Exception("Kullanıcı bilgisi bulunamadı.", 404, true);
            }

            return {
                kvkkApproval: client.kvkkApproval,
                kullaniciSozlesmesiApproval: client.kullaniciSozlesmesiApproval,
                SMSApproval: client.SMSApproval,
                MailApproval: client.MailApproval,
                NotificationApproval: client.NotificationApproval
            };
        } catch (error) {
            logger.error({err: serializeError(error)}, 'Onay durumları alınırken hata.');
            throw new Exception(error.message, 400);
        }
    }

    static async updateApprovalSettings(client_id, approvalSettings) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz erişim.", 401);
            }

            const client = await Client.findByPk(client_id);

            if (!client) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            await client.update({
                kvkkApproval: approvalSettings.kvkkApproval,
                kullaniciSozlesmesiApproval: approvalSettings.kullaniciSozlesmesiApproval,
                SMSApproval: approvalSettings.SMSApproval,
                MailApproval: approvalSettings.MailApproval,
                NotificationApproval: approvalSettings.NotificationApproval
            });

            return {
                showOnScreen: true,
                message: "Onay ayarları başarıyla güncellendi."
            };
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || true);
        }
    }

    static async approveKVKK(client_id) {
        try {
            const client = await Client.findByPk(client_id);

            if (!client) {
                throw new Exception("Kullanıcı bilgisi bulunamadı.", 404, true);
            }

            client.kvkkApproval = true;
            await client.save();

            return {
                updated: true,
                message: "KVKK onayı başarıyla kaydedildi."
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async getMyDailyExercises(client_id) {
        if (!client_id) {
            throw new Exception("Yetkisiz Erişim.", 400, true);
        }

        const {ExerciseAssignment, Exercise} = require("../Model/MainModel");
        const {Op} = require("sequelize");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const exercises = await ExerciseAssignment.findAll({
            where: {
                client_id,
                start_date: {[Op.lte]: today},
                end_date: {[Op.gte]: today},
                status: {
                    [Op.in]: ['active', 'completed']
                },
            },
            include: [
                {
                    model: Exercise,
                    as: 'Exercise',
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                }
            ],
            order: [['start_date', 'ASC']]
        });

        if (!exercises || exercises.length === 0) {
            throw new Exception("Bugün için atanmış egzersiz bulunamadı.", 404, true);
        }

        return exercises;
    }

    static async updateMyExercise(client_id, exercise_id, status, duration) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.", 400, true);
            }

            if (!exercise_id) {
                throw new Exception("Egzersiz seçimi gereklidir.", 400, true);
            }

            const existingExercise = await ExerciseAssignment.findOne({
                where: {
                    id: exercise_id,
                    client_id: client_id
                }
            });

            if (!existingExercise) {
                throw new Exception("Egzersiz bulunamadı veya bu egzersiz size ait değil.", 404, true);
            }

            const updated = await existingExercise.update({
                status: status,
                duration: duration,
            });

            if (!updated) {
                throw new Exception("Egzersiz durumu güncellenemedi.", 500, true);
            }

            return updated;
        } catch (error) {
            throw new Exception(error.message, error.statusCode || 400);
        }
    }

    static async updateFCMToken(client_id, fcmToken) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.", 400, true);
            }

            const client = await Client.findByPk(client_id);

            if (!client) {
                throw new Exception("Kullanıcı bulunamadı.", 404, true);
            }

            client.fcmToken = fcmToken;
            await client.save();

            return {
                showOnScreen: true,
                message: "FCM token başarıyla güncellendi."
            };
        } catch (error) {
            throw new Exception(error.message, error.status || 400);
        }
    }

    static async updateProfilePhoto(client_id, profilePhoto) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.", 400, true);
            }

            const client = await Client.findByPk(client_id);

            if (!client) {
                throw new Exception("Kullanıcı bulunamadı.", 404, true);
            }

            client.profilePhoto = profilePhoto;
            await client.save();

            return {
                showOnScreen: true,
                message: "Profil fotoğrafı başarıyla güncellendi."
            };
        } catch (error) {
            throw new Exception(error.message, error.status || 400);
        }
    }

    static async getMyNotifications(client_id, limit = 7) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.", 400, true);
            }

            const notifications = await Notification.findAll({
                where: { client_id: client_id },
                order: [['createdAt', 'DESC']],
                limit: limit
            });

            return notifications;
        } catch (error) {
            throw new Exception(error.message, error.status || 500, error.showOnScreen || true);
        }
    }

}

module.exports = ClientService;