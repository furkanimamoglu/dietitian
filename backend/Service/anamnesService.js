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

    static async updateAnamnes(dietitian_id, client_id, anamnesData){
    try {
        const {saglik_bilgileri, diyet_aliskanliklari, fiziksel_aktivite, ozel_notlar} = anamnesData;
        
        let anamnes = await Anamnes.findOne({
            where: {
                dietitian_id: dietitian_id,
                client_id: client_id
            }
        });
        
        if (!anamnes) {
            anamnes = await Anamnes.create({
                dietitian_id,
                client_id,
                saglik_bilgileri,
                diyet_aliskanliklari,
                fiziksel_aktivite,
                ozel_notlar
            });
            
            return anamnes;
        }
        
        anamnes.saglik_bilgileri = saglik_bilgileri;
        anamnes.diyet_aliskanliklari = diyet_aliskanliklari;
        anamnes.fiziksel_aktivite = fiziksel_aktivite;
        anamnes.ozel_notlar = ozel_notlar;
        
        await anamnes.save();
        
        return anamnes;
    } catch (error) {
        throw new Exception(error.message, 400);
    }
}

}

module.exports = AnamnesService;