const Exception = require("../Exception/Exception");
const Security = require("../Utils/Security");

class UtilService {

    async getUserRole(token) {
        try {
            if (!token) {
                throw new Exception("Yetkisiz erişim. Token bulunamadı.", 401);
            }

            const role = Security.getPermissionFromToken(token);

            if (!role) {
                throw new Exception("Geçersiz token veya rol bulunamadı.", 401);
            }

            return { role };
        } catch (error) {
            throw new Exception(error.message || "Bir hata oluştu.", error.status || 500, error.showOnScreen ?? true);
        }
    }

}

module.exports = new UtilService();
