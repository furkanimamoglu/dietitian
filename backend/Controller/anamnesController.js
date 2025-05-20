const AnamnesService = require("../Service/anamnesService");
const Security = require("../Utils/Security");

class anamnesController {

    static async getAnamnes(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const result = await AnamnesService.getAnamnes(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateAnamnesSaglik(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const {kronik_hastaliklar, alerjiler, ilac_kullanimi, gecmis_ameliyatlar, aile_saglik_gecmisi, uyku} = req.body;

            const result = await AnamnesService.updateAnamnesSaglik(dietitian_id, client_id,
                {kronik_hastaliklar, alerjiler, ilac_kullanimi, gecmis_ameliyatlar, aile_saglik_gecmisi, uyku});
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateAnamnesDiyetAliskanlik(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const {gunluk_su_tuketimi, ogun_duzeni, favori_yiyecekler, sevilmeyen_yiyecekler, atistirmalik_aliskanliklari, disarida_yemek} = req.body;

            const result = await AnamnesService.updateAnamnesDiyetAliskanlik(dietitian_id, client_id,
                {gunluk_su_tuketimi, ogun_duzeni, favori_yiyecekler, sevilmeyen_yiyecekler, atistirmalik_aliskanliklari, disarida_yemek});
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateAnamnesFizikselAktivite(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const {aktivite_seviyesi, egzersiz_aliskanliklari, sevdigi_sporlar, meslek_ve_aktivite_durumu} = req.body;

            const result = await AnamnesService.updateAnamnesFizikselAktivite(dietitian_id, client_id,
                {aktivite_seviyesi, egzersiz_aliskanliklari, sevdigi_sporlar, meslek_ve_aktivite_durumu});
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateAnamnesOzelNotlar(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const {ozel_not} = req.body;

            const result = await AnamnesService.updateAnamnesOzelNotlar(dietitian_id, client_id,
                ozel_not);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

}

module.exports = anamnesController;