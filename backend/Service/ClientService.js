const path = require('path');

const {
    Client,
    ExerciseAssignment,
    Notification,
    NutritionAssignment,
    NutritionPlan,
    Measurement,
    Recipe
} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const jwt = require('jsonwebtoken');
const config = require(path.join(__dirname, '..', 'config.json'));
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
                {expiresIn: '24h'}
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
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    id: client.id,
                    dietitian_id: client.dietitian_id,
                    phoneNumber: client.phoneNumber,
                    role: CLIENT
                },
                config.secretkey
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

    static async getMyNotifications(client_id) {
        try {
            if (!client_id) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const notifications = await Notification.findAll({
                where: {client_id: client_id}
            });

            if (!notifications || notifications.length === 0) {
                throw new Exception("Bildiriminiz yok.");
            }

            return notifications;
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

        return assignment.mealPlan;
    }

    static async getMyRecipes(client_id) {
        if (!client_id) {
            throw new Exception("Yetkisiz Erişim.", 400, true);
        }

        const recipes = await Recipe.findAll({
            where: {client_id: client_id, isPublic: true},
            order: [['createdAt', 'DESC']]
        });

        if (!recipes || recipes.length === 0) {
            throw new Exception("Kayıtlı tarif bulunamadı.", 404, true);
        }

        return recipes;
    }

    static async updateMealPlan(client_id, nutrition_plan_id, newMealPlan) {
        const assignment = await NutritionAssignment.findOne({
            where: {
                client_id: client_id,
                nutrition_plan_id: nutrition_plan_id
            }
        });

        if (!assignment) {
            throw new Exception("Belirtilen kullanıcıya ait beslenme ataması bulunamadı.", 404, true);
        }

        // Validate the new meal plan structure
        if (newMealPlan) {
            Object.keys(newMealPlan).forEach(day => {
                if (!newMealPlan[day]) return;

                Object.keys(newMealPlan[day]).forEach(mealType => {
                    const meals = newMealPlan[day][mealType];

                    // Check if it's using the new format with 'isim' and 'yenildi' fields
                    if (Array.isArray(meals) && meals.length > 0) {
                        if (!meals.every(meal => meal.hasOwnProperty('isim') && meal.hasOwnProperty('yenildi'))) {
                            // Transform to new format if using old format
                            newMealPlan[day][mealType] = meals.map(meal => {
                                if (typeof meal === 'string') {
                                    return {isim: meal, yenildi: false};
                                } else if (typeof meal === 'object' && !meal.hasOwnProperty('isim')) {
                                    // If it's an object but doesn't have the right structure
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

    static async getMyKVKKStatus(client_id) {
        try {
            const client = await Client.findOne({
                where: {id: client_id},
                attributes: ['kvkkApproval']
            });

            if (!client) {
                throw new Exception("Kullanıcı bilgisi bulunamadı.", 404, true);
            }

            return {
                kvkkApproval: client.kvkkApproval
            };
        } catch (error) {
            console.error("KVKK durumu alınırken hata:", error.message);
            return false;
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

}

module.exports = ClientService;