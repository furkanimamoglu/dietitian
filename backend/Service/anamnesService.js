const {Anamnes} = require("../Model/MainModel");
const Exception = require("../Exception/Exception");

class AnamnesService {

    static async getAnamnes(dietitian_id, client_id) {
        try {
            const anamnes = await Anamnes.findOne({
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

    static async updateAnamnes(dietitian_id, client_id, anamnesData) {
        try {
            let existingAnamnes = await Anamnes.findOne({
                where: {
                    dietitian_id,
                    client_id
                }
            });


            if (!existingAnamnes) {
                existingAnamnes = new Anamnes({
                    dietitian_id,
                    client_id
                });
            }

            existingAnamnes.saglik_bilgileri = anamnesData.saglik_bilgileri;
            existingAnamnes.diyet_aliskanliklari = anamnesData.diyet_aliskanliklari;
            existingAnamnes.fiziksel_aktivite = anamnesData.fiziksel_aktivite;
            existingAnamnes.ozel_notlar = anamnesData.ozel_notlar;

            return await existingAnamnes.save();
        } catch (error) {
            throw new Exception(error.message || "Anamnez verileri işlenirken bir hata oluştu.", 400, true);
        }
    }

}

module.exports = AnamnesService;