const InvoiceService = require("../Service/invoiceService");
const Security = require("../Utils/Security");
const {DIETITIAN} = require("../Enum/Role");

class invoiceController {

    static async getMyInvoices(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const result = await InvoiceService.getMyInvoices(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientInvoices(req, res) {
        try {
            const token = req.headers.authorization;
            const dietitian_id = Security.getUserIdFromToken(token);

            if (!token || !dietitian_id) {
                return res.status(401).json({
                    message: "Yetkisiz erişim."
                });
            }

            const {client_id} = req.query;

            const result = await InvoiceService.getClientInvoices(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteInvoice(req, res) {
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

            const {invoice_id} = req.query;

            const result = await InvoiceService.deleteInvoice(dietitian_id, invoice_id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateInvoice(req, res) {
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

            const {invoice_id, client_id, amount, status, package_id, issueDate, dueDate, description} = req.body;

            const result = await InvoiceService.updateInvoice(
                dietitian_id,
                invoice_id,
                {
                    client_id,
                    amount,
                    status,
                    package_id,
                    issueDate,
                    dueDate,
                    description
                }
            );

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addInvoice(req, res) {
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

            const {client_id, amount, status, package_id, issueDate, dueDate, description} = req.body;

            const result = await InvoiceService.addInvoice(dietitian_id, {
                client_id,
                amount,
                status,
                package_id,
                issueDate,
                dueDate,
                description
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }
}

module.exports = invoiceController;