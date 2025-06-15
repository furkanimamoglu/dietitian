const path = require('path');

const config = require(path.join(__dirname, '..', 'config.json'));
const mailer = require(path.join(__dirname, '..', 'Utils', 'Mailer.js'));
const getDogrulamaEmailTemplate = require(path.join(__dirname, '..', 'MailTemplates', 'Dogrulama.html'));

const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));

const {DIETITIAN, CLIENT} = require(path.join(__dirname, '..', 'Enum', 'Role'));

const {
    Dietitian,
    Client,
    Notes,
    DietitianSubPackage
} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {Op} = require('sequelize');
const moment = require("moment");


class DietitianService {

    static async login(phoneNumber, password) {
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
                {expiresIn: '30d'}
            );

            await dietitianInfo.update({token});

            return {
                ...dietitianInfo.dataValues,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async register(name, phoneNumber, email, password, ipAddress) {
        try {
            if (!name || !phoneNumber || !password || !email) {
                throw new Exception('Tüm parametreler doldurulmalıdır.', 400, true);
            }

            // const verificationCode = Math.floor(100000 + Math.random() * 900000);
            // const verificationCodeExpires = moment().add(10, 'minutes').toDate();
            //
            // const emailSent = await mailer.sendMail(
            //     email,
            //     'Diyetia Doğrulama Kodu',
            //     `Onay kodunuz: ${verificationCode}`,
            //     getDogrulamaEmailTemplate(verificationCode)
            // );
            //
            // if (!emailSent) {
            //     throw new Exception('Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar deneyiniz.', 500);
            // }

            const dietitian = await Dietitian.create({
                name,
                phoneNumber,
                email,
                password,
                role: DIETITIAN,
                ipAddress
            });
            //                verificationCode,
            //                 verificationCodeExpires,

            const token = jwt.sign(
                {
                    id: dietitian.id,
                    phoneNumber: dietitian.phoneNumber,
                    role: DIETITIAN
                },
                config.secretkey,
                {expiresIn: '30d'}
            );

            await dietitian.update({token});

            return {
                role: dietitian.role,
                token: token
            };
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async verifyEmail(mail, verificationCode) {
        try {
            if (!mail || !verificationCode) {
                throw new Exception('E-posta ve doğrulama kodu gereklidir.', 400, true);
            }

            const dietitian = await Dietitian.findOne({
                where: {email: mail}
            });

            if (!dietitian) {
                throw new Exception('Geçersiz e-posta.', 400, true);
            }

            if (Number(dietitian.verificationCode) !== verificationCode) {
                throw new Exception('Geçersiz doğrulama kodu.', 400, true);
            }

            if (!dietitian.verificationCodeExpires || dietitian.verificationCodeExpires < new Date()) {
                throw new Exception('Doğrulama kodunun süresi dolmuş.', 400, true);
            }

            await dietitian.update({
                verificationCode: null,
                verificationCodeExpires: null
            });

            return {status: "success", message: 'E-posta başarıyla doğrulandı.'};
        } catch (error) {
            throw new Exception(error.message || 'Bir hata oluştu.', 400);
        }
    }

    static async changePassword(user_id, oldPassword, newPassword) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            if (!oldPassword || !newPassword) {
                throw new Exception('Eski ve yeni şifre alanları doldurulmalıdır.', 400, true);
            }

            const dietitian = await Dietitian.findByPk(user_id);

            if (!dietitian) {
                throw new Exception('Diyetisyen bulunamadı.', 404, true);
            }

            if (dietitian.password !== oldPassword) {
                throw new Exception('Eski şifre yanlış.', 400, true);
            }

            await dietitian.update({password: newPassword});

            return {message: 'Şifre başarıyla değiştirildi.'};
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async updatePhoneNumber(user_id, phoneNumber) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            throw new Exception("SMS doğrulama henüz aktif değil. Bu alan geliştirme aşamasındadır.", 503, true);

            const dietitian = await Dietitian.findByPk(user_id);

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            if (!phoneNumber) {
                throw new Exception("Telefon numarası gereklidir.", 400, true);
            }

            await dietitian.update({phoneNumber});

            return dietitian;
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || true);
        }
    }

    static async updateEmail(user_id, email) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401);
            }

            const dietitian = await Dietitian.findByPk(user_id);

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            if (!email) {
                throw new Exception("E-posta adresi gereklidir.", 400, true);
            }

            await dietitian.update({email});

            return dietitian;
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || true);
        }
    }

    static async delete(id) {
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

    static async changeClientStatus(user_id, client_id, status) {
        try {
            const client = await Client.findOne({
                where: {
                    id: client_id,
                    dietitian_id: user_id
                }
            });

            if (!client) {
                throw new Exception('Client bulunamadı veya erişim yetkiniz yok.', 400, true);
            }

            client.status = status;
            await client.save();

            return client;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async registerClient(user_id, name, email, password, phoneNumber, gender) {
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
                config.secretkey,
                {expiresIn: '30d'}
            );

            return await Client.create({
                dietitian_id: user_id,
                name: name,
                gender: gender,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                status: 'Aktif',
                role: CLIENT,
                token: token
            })
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async deleteClient(user_id, client_id) {
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

    static async updateClient(user_id, client_id, updateData) {
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

    static async getMyClient(user_id, client_id) {
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


    static async getMyAllClients(user_id) {
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

    static async getMyActiveClientCount(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        const result = await Client.count({
            where: {dietitian_id}
        });

        return {count: result};
    }

    static async generateQrCode(user_id) {
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

    static async getDietitianInfo(user_id) {
        try {
            if (!user_id) {
                throw new Exception("Yetkisiz Erişim.", 401, true);
            }

            const dietitian = await Dietitian.findOne({
                where: {id: user_id},
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

    static async getDietitianNameById(dietitian_id) {
        try {
            if (!dietitian_id) {
                throw new Exception("Yetkisiz Erişim.", 401, true);
            }

            const dietitian = await Dietitian.findOne({
                where: {id: dietitian_id}
            });

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            return {dietitian_name: dietitian.name};
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async globalSearchbar(user_id, query) {
        try {
            if (!user_id) {
                throw new Error("Yetkisiz Erişim.");
            }

            const data = [
                {type: "page", name: "Danışanlarım", url: "/danisanlarim"},
                {type: "page", name: "Randevularım", url: "/randevularim"},
                {type: "page", name: "Ayarlar", url: "/ayarlar"},
                {type: "page", name: "Beslenme", url: "/beslenme"},
                {type: "page", name: "Egzersiz", url: "/egzersiz"},
                {type: "page", name: "Finans", url: "/finans"},
                {type: "page", name: "Tarif", url: "/tarif"},
                {type: "page", name: "Egzersiz", url: "/egzersiz"},
                {type: "page", name: "Mesaj", url: "/mesaj"}
            ];

            const dietitian = await Dietitian.findOne({
                where: {id: user_id},
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
                    name: `${client.name}`,
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

    static async getMyNotes(dietitian_id) {
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

    static async addNote(dietitian_id, note) {
        try {
            return await Notes.create({
                dietitian_id,
                noteContent: note
            });
        } catch (error) {
            throw new Exception("Not eklenirken bir hata oluştu.", 500, true);
        }
    }

    static async getDietitianSubscriptionDetails(dietitian_id) {
        try {
            if (!dietitian_id) {
                throw new Exception("Yetkisiz erişim.", 401, true);
            }

            const dietitian = await Dietitian.findByPk(dietitian_id, {
                attributes: ['subscription_start_date', 'subscription_end_date', 'subscription_type'],
                include: [{
                    model: DietitianSubPackage,
                    attributes: ['client_limit', 'appointment_limit', 'nutrition_plan_limit', 'exercise_limit',
                        'recipe_limit', 'sms_allowed', 'special_support'],
                    as: 'subscription'
                }]
            });

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            return dietitian;
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || true);
        }
    }

    static async changeDietitianSubscriptionToFree(dietitian_id) {
        try {
            if (!dietitian_id) {
                throw new Exception("Yetkisiz erişim.", 401, true);
            }

            const dietitian = await Dietitian.findByPk(dietitian_id);

            if (!dietitian) {
                throw new Exception("Diyetisyen bulunamadı.", 404, true);
            }

            await dietitian.update({
                subscription_start_date: null,
                subscription_end_date: null,
                subscription_type: 'free'
            });

            return {message: "Abonelik başarıyla ücretsiz olarak değiştirildi."};
        } catch (error) {
            throw new Exception(error.message, error.status || 400, error.showOnScreen || true);
        }
    }

    static async updateClientWaterLimit(dietitian_id, client_id, waterLimit) {
        try {
            if (!dietitian_id) {
                throw new Exception("Yetkisiz erişim.", 401);
            }

            const client = await Client.findOne({
                where: {
                    id: client_id,
                    dietitian_id: dietitian_id
                }
            });

            if (!client) {
                throw new Exception('Client bulunamadı veya erişim yetkiniz yok.', 400, true);
            }

            client.dailyWaterIntake = waterLimit;
            await client.save();

            return client;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

}

module.exports = DietitianService;