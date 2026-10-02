const path = require("path");

const PackageService = require(path.join(__dirname, "..", "Service", "PackageService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));

class packageController {

    static async getMyPackages(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await PackageService.getMyPackages(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addPackage(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {name, description, type, price} = req.body;

            const result = await PackageService.addPackage(dietitian_id, {name, description, type, price});

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updatePackage(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {package_id, name, description, type, price} = req.body;

            const result = await PackageService.updatePackage(dietitian_id, package_id, {
                name,
                description,
                type,
                price
            });
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deletePackage(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {package_id} = req.query;

            const result = await PackageService.deletePackage(dietitian_id, package_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getPackageItemsFromPackage(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {package_id} = req.query;

            const result = await PackageService.getPackageItemsFromPackage(dietitian_id, package_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addPackageItem(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {package_id, name} = req.body;

            const result = await PackageService.addPackageItem(dietitian_id, package_id, {name});

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updatePackageItem(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {item_id, name} = req.body;

            const result = await PackageService.updatePackageItem(dietitian_id, item_id, {name});
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deletePackageItem(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {item_id} = req.query;

            const result = await PackageService.deletePackageItem(dietitian_id, item_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }
}

module.exports = packageController;