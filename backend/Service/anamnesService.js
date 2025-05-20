const {Anamnes} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");

class AnamnesService {

    static async getAnamnes(dietitian_id, client_id) {
        try {
            const anamnes = await Anamnes.findAll({
                where: {
                    dietitian_id: dietitian_id,
                    client_id: client_id
                }
            });

            if (!anamnes) {
                throw new Exception('Anamnes bulunamadı.', 404, true);
            }

            return anamnes;
        } catch (error) {
            throw new Exception(error.message, 400);
        }
    }

    static async updateAnamnesSaglik(dietitian_id, client_id, saglikData) {
        try {
            let anamnes = await Anamnes.findOne({
                where: {
                    dietitian_id,
                    client_id
                }
            });

            if (!anamnes) {
                anamnes = await Anamnes.create({
                    dietitian_id,
                    client_id,
                    saglik_bilgileri: saglikData
                });

                return {
                    message: "Yeni anamnez kaydı oluşturuldu.",
                    data: anamnes.saglik_bilgileri
                };
            }

            await anamnes.update({ saglik_bilgileri: saglikData });

            return anamnes.saglik_bilgileri;
        } catch (error) {
            throw new Exception(error.message || "Sağlık bilgileri işlenirken bir hata oluştu.", 400, true);
        }
    }

    static async updateAnamnesDiyetAliskanlik(dietitian_id, client_id, diyetData) {
        try {
            let anamnes = await Anamnes.findOne({
                where: {
                    dietitian_id,
                    client_id
                }
            });

            if (!anamnes) {
                anamnes = await Anamnes.create({
                    dietitian_id,
                    client_id,
                    diyet_aliskanliklari: diyetData
                });

                return {
                    message: "Yeni anamnez kaydı oluşturuldu.",
                    data: anamnes.diyet_aliskanliklari
                };
            }

            await anamnes.update({ diyet_aliskanliklari: diyetData });

            return anamnes.diyet_aliskanliklari;
        } catch (error) {
            throw new Exception(error.message || "Diyet Alışkanlıkları işlenirken bir hata oluştu.", 400, true);
        }
    }

    static async updateAnamnesFizikselAktivite(dietitian_id, client_id, fizikselData) {
        try {
            let anamnes = await Anamnes.findOne({
                where: {
                    dietitian_id,
                    client_id
                }
            });

            if (!anamnes) {
                anamnes = await Anamnes.create({
                    dietitian_id,
                    client_id,
                    fiziksel_aktivite: fizikselData
                });

                return {
                    message: "Yeni anamnez kaydı oluşturuldu.",
                    data: anamnes.fiziksel_aktivite
                };
            }

            await anamnes.update({ fiziksel_aktivite: fizikselData });

            return anamnes.fiziksel_aktivite;
        } catch (error) {
            throw new Exception(error.message || "Fiziksel Aktivite işlenirken bir hata oluştu.", 400, true);
        }
    }

    static async updateAnamnesOzelNotlar(dietitian_id, client_id, ozel_not) {
        try {
            let anamnes = await Anamnes.findOne({
                where: {
                    dietitian_id,
                    client_id
                }
            });

            if (!anamnes) {
                anamnes = await Anamnes.create({
                    dietitian_id,
                    client_id,
                    ozel_notlar: ozel_not
                });

                return {
                    message: "Yeni anamnez kaydı oluşturuldu.",
                    data: anamnes.ozel_notlar
                };
            }

            await anamnes.update({ ozel_notlar: ozel_not });

            return {
                ozel_notlar: anamnes.ozel_notlar
            };
        } catch (error) {
            throw new Exception(error.message || "Fiziksel Aktivite işlenirken bir hata oluştu.", 400, true);
        }
    }

}

module.exports = AnamnesService;