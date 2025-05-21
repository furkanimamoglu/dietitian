const {Client, ExerciseAssignment, Exercise, Notification, NutritionAssignment, NutritionPlan, Measurement} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const {CLIENT} = require("../Enum/Role");
const {Op} = require("sequelize");

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

    static async register(dietitian_id, name, phoneNumber, password, ipAddress) {
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

    static async getMyNotifications(phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const notifications = await Notification.findAll({
                where: {phoneNumber: phoneNumber}
            });

            if (!notifications || notifications.length === 0) {
                throw new Exception("Bildiriminiz yok.");
            }

            return notifications;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async readMyAllNotifications(phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new Exception("Yetkisiz Erişim.");
            }

            const [affectedRows] = await Notification.update(
                {isRead: true},
                {
                    where: {phoneNumber: phoneNumber, isRead: false}
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
                where: { client_id },
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

    static async getTodayMeal(clientId, todayDate) {
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

        // If the assignment doesn't have a mealPlan yet, or has the old format, we need to transform it
        if (!assignment.mealPlan) {
            // If no mealPlan exists in assignment, create a new one based on NutritionPlan's mealPlan
            if (assignment.NutritionPlan && assignment.NutritionPlan.mealPlan) {
                const transformedMealPlan = {};
                Object.keys(assignment.NutritionPlan.mealPlan).forEach(day => {
                    transformedMealPlan[day] = {};
                    Object.keys(assignment.NutritionPlan.mealPlan[day] || {}).forEach(mealType => {
                        // Get the meal items based on the format
                        let mealItems = [];
                        const mealData = assignment.NutritionPlan.mealPlan[day][mealType];

                        // Handle complex format with main and alternatives
                        if (mealData && typeof mealData === 'object' && !Array.isArray(mealData) && mealData.main) {
                            mealItems = [...mealData.main];
                        }
                        // Handle simple array format
                        else if (Array.isArray(mealData)) {
                            mealItems = [...mealData];
                        }
                        // Handle string format (backward compatibility)
                        else if (typeof mealData === 'string') {
                            mealItems = mealData.split(',').map(item => item.trim()).filter(item => item !== '');
                        }

                        // Transform to new format with "yenildi" field
                        transformedMealPlan[day][mealType] = mealItems.map(item => ({
                            isim: item,
                            yenildi: false
                        }));
                    });
                });

                // Update the assignment with the new format
                assignment.mealPlan = transformedMealPlan;
                await assignment.save();
            }
        }

        return assignment;
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

    static async updateMyExercise(client_id, exercise_id, status) {
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
                completed_at: status === 'completed' ? new Date() : existingExercise.completed_at
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