// Libraries
const config = require('../config.json');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Imports
const Exception = require('../Exception/Exception');

// Enums
const {DIETITIAN, CLIENT} = require("../Enum/Role");

// Models
const {Dietitian, Client, NutritionPlan, NutritionCategory} = require('../Model/MainModel');

class DietitianService {

    async login(email, password) {
        try {
            const dietitianInfo = await Dietitian.findOne({
                where: {
                    email: email,
                    password: password
                }
            });

            if (!dietitianInfo) {
                throw new Exception('Hatalı giriş bilgileri.', 400, true);
            }

            const token = jwt.sign(
                {
                    id: dietitianInfo.id,
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

    async register(email, password, ipAddress) {
        try {
            if (!email || !password) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            const dietitian = await Dietitian.create({
                email: email,
                password: password,
                role: DIETITIAN,
                ipAddress: ipAddress
            });

            const token = jwt.sign(
                {
                    id: dietitian.id,
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
                throw new Error('Diyetisyen bulunamadı.');
            }

            return dietitian.Clients;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getAllMyNutritionCategories(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
                include: [
                    {
                        model: NutritionCategory,
                        as: 'categories',
                    },
                ],
            });

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 404);
            }

            return dietitian.categories;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
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
            const err = new Error('QR kodu oluşturulamadı.');
            err.status = 500;
            throw err;
        }
    }

    async getDietitianInfo(user_id) {
        try {
            if (!user_id) {
                throw new Error("Yetkisiz Erişim.");
            }

            const dietitian = await Dietitian.findOne({
                where: { id: user_id },
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            });

            if (!dietitian) {
                throw new Error("Diyetisyen bulunamadı.");
            }

            return dietitian;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    async getDietitianNameById(dietitian_id) {
        try {
            if (!dietitian_id) {
                throw new Error("Diyetisyen bulunamadı.");
            }

            const dietitian = await Dietitian.findOne({
                where: { id: dietitian_id }
            });

            if (!dietitian) {
                throw new Error("Diyetisyen bulunamadı.");
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
                throw new Error('Diyetisyen bulunamadı.');
            }

            dietitian.Clients.forEach(client => {
                data.push({
                    type: "danisan",
                    name: `${client.name} ${client.surname}`,
                    url: `/danisan/${client.id}`,
                });
            });

            query = query ? query.toLowerCase() : "";

            const filteredData = data.filter(item =>
                item.name.toLowerCase().includes(query)
            );

            return filteredData;
        } catch (error) {
            throw new Error(error.message);
        }
    }

}

module.exports = new DietitianService();