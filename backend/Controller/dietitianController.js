const path = require("path");

const DietitianService = require(path.join(__dirname, "..", "Service", "DietitianService"));
const Security = require(path.join(__dirname, "..", "Utils", "Security"));
const {Notes} = require(path.join(__dirname, "..", "Model", "MainModel"));
const {DIETITIAN} = require(path.join(__dirname, "..", "Enum", "Role"));

class DietitianController {
    static async login(req, res) {
        try {
            const {phoneNumber, password} = req.body;

            if (!phoneNumber || !password) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.login(phoneNumber, password);

            res.status(200).json({
                token: result.token,
                role: result.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async register(req, res) {
        try {
            const {name, phoneNumber, password, email} = req.body;
            const ipAddress = req.ip;

            if (!name || !phoneNumber || !password || !email || !ipAddress) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.register(name, phoneNumber, email, password, ipAddress);

            res.status(200).json({
                token: result.token,
                role: result.role
            });
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const {email, verificationCode} = req.body;

            if (!email || !verificationCode) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Mail ve Verification Code parametresi gereklidir.'
                });
            }

            const result = await DietitianService.verifyEmail(email, verificationCode);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async changePassword(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {oldPassword, newPassword} = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.changePassword(dietitian_id, oldPassword, newPassword);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async updatePhoneNumber(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {phoneNumber} = req.body;

            if (!phoneNumber) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Telefon numarası gereklidir."
                });
            }

            const result = await DietitianService.updatePhoneNumber(dietitian_id, phoneNumber);
            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || true,
                message: err.message || "Bir hata oluştu."
            });
        }
    }

    static async changeMail(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {email} = req.body;

            if (!email) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "E-posta adresi gereklidir."
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Geçersiz e-posta formatı."
                });
            }

            const result = await DietitianService.updateEmail(dietitian_id, email);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || true,
                message: err.message || "Bir hata oluştu."
            });
        }
    }

    static async changeClientStatus(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id, status} = req.body;

            if (!client_id || !status) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.changeClientStatus(dietitian_id, client_id, status);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async registerClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {name, email, password, phoneNumber, gender} = req.body;

            if (!phoneNumber || !password || !name) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.registerClient(dietitian_id, name, email, password, phoneNumber, gender);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async deleteClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.body;

            if (!client_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.deleteClient(dietitian_id, client_id);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async updateClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {id, name, email, phoneNumber, gender, status} = req.body;

            if (!id || !name || !phoneNumber || !status) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Tüm parametreler doldurulmalıdır."
                });
            }

            const updateData = {name, email, phoneNumber, gender, status};

            const result = await DietitianService.updateClient(dietitian_id, id, updateData);
            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || false,
                message: err.message || "Bir hata oluştu.",
            });
        }
    }

    static async createMyQR(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const qrData = await DietitianService.generateQrCode(dietitian_id);

            return res.status(200).json({
                qrData
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async getMyClient(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const result = await DietitianService.getMyClient(dietitian_id, client_id)
            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async getAllMyClients(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getMyAllClients(dietitian_id);

            res.status(200).json(result)
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            });
        }
    }

    static async globalSearchbar(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {search} = req.query;

            const result = await DietitianService.globalSearchbar(dietitian_id, search);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getDietitianInfo(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getDietitianInfo(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getDietitianNameById(req, res) {
        try {
            const {dietitian_id} = req.query;
            const result = await DietitianService.getDietitianNameById(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async getMyActiveClientCount(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getMyActiveClientCount(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen ?? true,
                message: error.message || "Bir hata oluştu."
            });
        }
    }

    static async getMyNotes(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.getMyNotes(dietitian_id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async addNote(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {note} = req.body

            if (!note) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Note içeriği girilmedi."
                });
            }

            const result = await DietitianService.addNote(dietitian_id, note);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "Bir hata oluştu.",
                showOnScreen: error.showOnScreen ?? true
            });
        }
    }

    static async deleteNote(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {note_id} = req.query;

            if (!note_id) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: "Silinecek notun ID'si belirtilmelidir."
                });
            }

            const note = await Notes.findByPk(note_id);

            if (!note) {
                return res.status(404).json({
                    success: false,
                    message: "Not bulunamadı."
                });
            }

            await note.destroy();

            return res.status(200).json({
                success: true,
                message: "Not başarıyla silindi."
            });
        } catch (error) {
            console.error("deleteNote error:", error);
            return res.status(500).json({
                success: false,
                message: "Bir hata oluştu.",
                error: error.message
            });
        }
    }

    static async getDietitianSubscriptionDetails(req, res) {
        try {
            const {dietitian_id} = req.query;

            const result = await DietitianService.getDietitianSubscriptionDetails(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async changeDietitianSubscriptionToFree(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const result = await DietitianService.changeDietitianSubscriptionToFree(dietitian_id);

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen || true,
                message: error.message || "Bir hata oluştu.",
            });
        }
    }

    static async updateClientWaterLimit(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id, waterLimit} = req.body;

            if (!client_id || waterLimit === undefined) {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm parametreler doldurulmalıdır.'
                });
            }

            const result = await DietitianService.updateClientWaterLimit(dietitian_id, client_id, waterLimit);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen,
                message: err.message
            });
        }
    }

    static async updateApprovalSettings(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);
            const permission = Security.checkUserPermission(token, DIETITIAN);

            if (!token || !dietitian_id || !permission) {
                return res.status(401).json({
                    showOnScreen: true,
                    message: "Yetkisiz erişim."
                });
            }

            const {
                kvkkApproval,
                kullaniciSozlesmesiApproval,
                SMSApproval,
                MailApproval,
                NotificationApproval
            } = req.body;

            if (!kvkkApproval || !kullaniciSozlesmesiApproval || !SMSApproval || !MailApproval || !NotificationApproval)
            {
                return res.status(400).json({
                    showOnScreen: true,
                    message: 'Tüm onay parametreleri sağlanmalıdır.'
                });
            }

            const approvalSettings = {
                kvkkApproval,
                kullaniciSozlesmesiApproval,
                SMSApproval,
                MailApproval,
                NotificationApproval
            };

            const result = await DietitianService.updateApprovalSettings(dietitian_id, approvalSettings);

            res.status(200).json(result);
        } catch (err) {
            res.status(err.status || 500).json({
                showOnScreen: err.showOnScreen || true,
                message: err.message || "Onay ayarları güncellenirken bir hata oluştu."
            });
        }
    }

}

module.exports = DietitianController;
