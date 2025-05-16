// Libraries
const config = require('../config.json');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Imports
const Exception = require('../Exception/Exception');

// Enums
const {DIETITIAN, CLIENT} = require("../Enum/Role");

// Models
const {Dietitian, Client, NutritionPlan, NutritionCategory, NutritionAssignment, Notes} = require('../Model/MainModel');
const {Op} = require("sequelize");
const Security = require("../Utils/Security");

class DietitianService {

    async login(phoneNumber, password) {
        try {
            const dietitianInfo = await Dietitian.findOne({
                where: {
                    phoneNumber: phoneNumber,
                    password: password
                }
            });

            if (!dietitianInfo) {
                throw new Exception('Hatalı giriş bilgileri.', 400, true);
            }

            const token = jwt.sign(
                {
                    id: dietitianInfo.id,
                    phoneNumber: dietitianInfo.phoneNumber,
                    role: dietitianInfo.role
                },
                config.secretkey,
                { expiresIn: '24h' }
            );

            await dietitianInfo.update({ token });

            return {
                ...dietitianInfo.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async register(phoneNumber, password, ipAddress) {
        try {
            if (!phoneNumber || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const dietitian = await Dietitian.create({
                phoneNumber: phoneNumber,
                password: password,
                role: DIETITIAN,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    id: dietitian.id,
                    phoneNumber: dietitian.phoneNumber,
                    role: DIETITIAN
                },
                config.secretkey
            );

            await dietitian.update({ token });

            return {
                role: dietitian.role,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async delete(id) {
        try {
            const dietitian = await Dietitian.findByPk(id);

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 400, true);
            }

            await dietitian.destroy();
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async registerClient(user_id, name, email, password, phoneNumber, gender) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            if (!phoneNumber || !password || !name) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const token = jwt.sign(
                {
                    email: email,
                    role: CLIENT
                },
                config.secretkey
            );

            return await Client.create({
                dietitian_id: user_id,
                name: name,
                gender: gender,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                role: CLIENT,
                token: token
            })
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async deleteClient(user_id, client_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const deletedRows = await Client.destroy({
                where: {
                    id: client_id,
                    dietitian_id: user_id
                }
            });

            if (deletedRows === 0) {
                throw new Exception('Danışan bulunamadı.', 400, true);
            }

            return {
                message: 'ID:' + client_id + ' danışanınız başarıyla silindi.'
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async updateClient(user_id, client_id, updateData) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz erişim.", 401);
            }

            const client = await Client.findOne({
                where: {
                    id: client_id,
                    dietitian_id: user_id,
                },
            });

            if (!client) {
                throw new Exception("Danışan bulunamadı.", 404, true);
            }

            await client.update(updateData);

            return client;
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || false);
        }
    }

    async getMyClient(user_id, client_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401, true);
            }

            const dietitian = await Dietitian.findOne({
                where: {
                    id: user_id
                },
                include: [
                    {
                        model: Client,
                        as: 'Clients',
                        where: {
                            id: client_id
                        }
                    }
                ]
            });

            if (!dietitian) {
                throw new Error('Diyetisyen bulunamadı veya bu Client size bağlı değil.');
            }

            if (!dietitian.Clients || dietitian.Clients.length === 0) {
                throw new Error('Hedef Client bulunamadı.');
            }

            return dietitian.Clients[0];
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }


    async getMyAllClients(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: {
                    id: user_id
                },
                include: [
                    {
                        model: Client,
                        as: 'Clients',
                    }
                ]
            });

            if (!dietitian) {
                return [];
            }

            return dietitian.Clients;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getMyActiveClientCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const result = await Client.count({
            where: { dietitian_id }
        });

        return {count: result};
    }

    async generateQrCode(user_id) {
        if (!user_id) {
            const err = new Error('Diyetisyen ID gerekli.');
            err.status = 400;
            throw err;
        }

        const registerUrl = `${config.app_scheme}://register?dietitian_id=${user_id}`;

        try {
            return await QRCode.toDataURL(registerUrl, {
                errorCorrectionLevel: 'M',
                margin: 2,
                width: 300
            });
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getDietitianInfo(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401, true);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            });

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            return dietitian;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getDietitianNameById(dietitian_id) {
        try {
            if (!dietitian_id) {
                throw new Exception("Yetkisiz Erişim.", 401, true);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: dietitian_id }
            });

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            return {dietitian_name: dietitian.name};
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async addNutritionCategory(dietitian_id, category_name) {
        if (!dietitian_id) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Yetkisiz Erişim."
            };
        }

        if (!category_name) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Kategori adı boş olamaz."
            };
        }

        return await NutritionCategory.create({
            name: category_name,
            dietitian_id
        });
    }

    async getNutritionCategories(dietitian_id) {
        if (!dietitian_id) {
            throw {
                status: 401,
                showOnScreen: true,
                message: "Diyetisyen kimliği geçersiz."
            };
        }

        return await NutritionCategory.findAll({
            where: {dietitian_id},
            order: [['id', 'ASC']]
        });
    }

    async deleteNutritionCategory(dietitian_id, category_id) {
        if (!dietitian_id || !category_id) {
            throw {
                status: 400,
                showOnScreen: true,
                message: "Geçersiz istek. Diyetisyen veya kategori bilgisi eksik."
            };
        }

        const category = await NutritionCategory.findOne({
            where: {
                id: category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw {
                status: 403,
                showOnScreen: true,
                message: "Bu kategori size ait değil veya bulunamadı."
            };
        }

        await category.destroy();

        return {
            success: true,
            message: "Kategori başarıyla silindi."
        };
    }

    async globalSearchbar(user_id, query) {
        try {
            if (!user_id) {
                throw new Error("Yetkisiz Erişim.");
            }
            // TODO: Yalnızca diyetisyen rolüne sahip kişiler için doğrulama yapacağız.
            // TODO: Rol kontrolü gelecek.
            const data = [
                { type: "page", name: "Danışanlarım", url: "/danisanlarim" },
                { type: "page", name: "Randevularım", url: "/randevularim" },
                { type: "page", name: "Ayarlar", url: "/ayarlar" },
                { type: "page", name: "Profil", url: "/profil" },
                { type: "page", name: "Beslenme", url: "/beslenme" },
                { type: "page", name: "Egzersiz", url: "/egzersiz" },
                { type: "page", name: "Finans", url: "/finans" },
                { type: "page", name: "Tarif", url: "/tarif" },
                { type: "page", name: "Egzersiz", url: "/egzersiz" },
                { type: "page", name: "Mesaj", url: "/mesaj" }
            ];

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
                include: [
                    {
                        model: Client,
                        as: 'Clients',
                    }
                ]
            });

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            dietitian.Clients.forEach(client => {
                data.push({
                    type: "danisan",
                    name: `${client.name} ${client.surname}`,
                    url: `/danisan/${client.id}`,
                });
            });

            query = query ? query.toLowerCase() : "";

            return data.filter(item =>
                item.name.toLowerCase().includes(query)
            );
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async assignNutritionPlanToClient({ dietitian_id, client_id, nutrition_plan_id, start_date, end_date, note }) {
        const client = await Client.findOne({
            where: {
                id: client_id,
                dietitian_id: dietitian_id
            }
        });

        if (!client) {
            throw new Exception("Bu danışan size ait değil. Atama yapılamaz.", 401, true);
        }

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id: dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil. Atama yapılamaz.", 401, true);
        }

        const existingAssignment = await NutritionAssignment.findOne({
            where: {
                client_id,
                [Op.or]: [
                    {
                        start_date: { [Op.between]: [start_date, end_date] }
                    },
                    {
                        end_date: { [Op.between]: [start_date, end_date] }
                    },
                    {
                        start_date: { [Op.lte]: start_date },
                        end_date: { [Op.gte]: end_date }
                    }
                ]
            }
        });

        if (existingAssignment) {
            throw new Exception("Bu tarih aralığında danışana atanmış başka bir plan zaten var.", 409, true);
        }

        // Transform the meal plan structure to include "yenildi" field for each meal item
        const transformedMealPlan = {};
        if (plan.mealPlan) {
            Object.keys(plan.mealPlan).forEach(day => {
                transformedMealPlan[day] = {};
                Object.keys(plan.mealPlan[day] || {}).forEach(mealType => {
                    // Get the meal items based on the format
                    let mealItems = [];
                    const mealData = plan.mealPlan[day][mealType];
                    
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
        }

        return await NutritionAssignment.create({
            client_id,
            nutrition_plan_id,
            start_date,
            end_date,
            note,
            mealPlan: transformedMealPlan
        });
    }


    async getNutritionPlans(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await NutritionPlan.findAll({
            where: {dietitian_id},
            order: [['id', 'ASC']]
        });
    }

    async deleteNutritionPlan(dietitian_id, nutrition_plan_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id: dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil veya bulunamadı.", 403, true);
        }

        await plan.destroy();

        return { success: true, message: "Beslenme planı başarıyla silindi." };
    }

    async addNutritionPlan(dietitian_id, { title, description, image, category_id, mealPlan }) {
        if (!dietitian_id || !title || !description || !category_id) {
            throw new Exception("Başlık, açıklama ve kategori zorunludur.", 400, true);
        }

        const category = await NutritionCategory.findOne({
            where: {
                id: category_id,
                dietitian_id: dietitian_id
            }
        });

        if (!category) {
            throw new Exception("Bu kategori size ait değil.", 403, true);
        }

        const existing = await NutritionPlan.findOne({
            where: {
                title,
                dietitian_id
            }
        });

        if (existing) {
            throw new Exception("Bu isimde bir plan zaten mevcut.", 409, true);
        }

        if (mealPlan && typeof mealPlan !== 'object') {
            throw new Exception("Meal plan geçerli bir JSON formatında olmalıdır.", 400, true);
        }

        return await NutritionPlan.create({
            title,
            description,
            image: image || '/placeholder.png',
            category_id,
            mealPlan,
            dietitian_id
        });
    }

    async updateNutritionPlan(dietitian_id, nutrition_plan_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const { title, description, image, category_id, mealPlan } = updateData;

        const plan = await NutritionPlan.findOne({
            where: {
                id: nutrition_plan_id,
                dietitian_id
            }
        });

        if (!plan) {
            throw new Exception("Bu plan size ait değil veya bulunamadı.", 403, true);
        }

        if (mealPlan) {
            if (typeof mealPlan !== 'object') {
                throw new Exception("mealPlan geçerli bir JSON formatında olmalıdır.", 400, true);
            }
        }

        await plan.update({
            title: title ?? plan.title,
            description: description ?? plan.description,
            image: image ?? plan.image,
            category_id: category_id ?? plan.category_id,
            mealPlan: mealPlan ?? plan.mealPlan
        });

        return plan;
    }

    async getNutritionAssignmentPlanByClient(dietitian_id, client_id, startDate, endDate) {
        return await NutritionAssignment.findAll({
            where: {
                client_id,
                ...(startDate && endDate && {
                    start_date: { [Op.lte]: endDate },
                    end_date: { [Op.gte]: startDate }
                })
            },
            order: [['start_date', 'ASC']]
        });
    }

    async getMyNotes(dietitian_id) {
        try {
            return await Notes.findAll({
                where: {
                    dietitian_id: dietitian_id
                },
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Exception("Notlar alınırken bir hata oluştu.", 500, true);
        }
    }

    async addNote(dietitian_id, note) {
        try {
            return await Notes.create({
                dietitian_id,
                noteContent: note
            });
        } catch (error) {
            throw new Exception("Not eklenirken bir hata oluştu.", 500, true);
        }
    }

}

module.exports = new DietitianService();