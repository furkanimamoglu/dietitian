const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const {Package, PackageItems} = require(path.join(__dirname, '..', 'Model', 'MainModel'));

class PackageService {

    static async getMyPackages(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Package.findAll({
            where: {dietitian_id}
        });
    }

    static async addPackage(dietitian_id, packageData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!packageData || !packageData.name || !packageData.description || !packageData.type || !packageData.price) {
            throw new Exception("Eksik Paket bilgisi gönderildi.", 400, true);
        }

        return await Package.create({
            ...packageData,
            dietitian_id: dietitian_id
        });
    }

    static async updatePackage(dietitian_id, package_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await Package.findOne({
            where: {
                id: package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Tarif bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await recipe.update(updateData);
    }


    static async deletePackage(dietitian_id, package_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const recipe = await Package.findOne({
            where: {
                id: package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!recipe) {
            throw new Exception("Paket bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await recipe.destroy();

        return {success: true, message: "Paket başarıyla silindi."};
    }

    static async getPackageItemsFromPackage(dietitian_id, package_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const packageExists = await Package.findOne({
            where: {
                id: package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!packageExists) {
            throw new Exception("Paket bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await PackageItems.findAll({
            where: {package_id: package_id}
        });
    }

    static async addPackageItem(dietitian_id, package_id, serviceData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const packageExists = await Package.findOne({
            where: {
                id: package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!packageExists) {
            throw new Exception("Paket bulunamadı veya yetkisiz erişim.", 404, true);
        }

        if (!serviceData || !serviceData.name) {
            throw new Exception("Eksik servis bilgisi gönderildi.", 400, true);
        }

        return await PackageItems.create({
            package_id,
            name: serviceData.name
        });
    }

    static async updatePackageItem(dietitian_id, item_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const item = await PackageItems.findByPk(item_id);

        if (!item) {
            throw new Exception("Servis bulunamadı.", 404, true);
        }

        const packageExists = await Package.findOne({
            where: {
                id: item.package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!packageExists) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        return await item.update(updateData);
    }

    static async deletePackageItem(dietitian_id, item_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const item = await PackageItems.findByPk(item_id);

        if (!item) {
            throw new Exception("Servis bulunamadı.", 404, true);
        }

        const packageExists = await Package.findOne({
            where: {
                id: item.package_id,
                dietitian_id: dietitian_id
            }
        });

        if (!packageExists) {
            throw new Exception("Yetkisiz erişim.", 401, true);
        }

        await item.destroy();

        return {success: true, message: "Paket Hizmeti başarıyla silindi."};
    }
}

module.exports = PackageService;
