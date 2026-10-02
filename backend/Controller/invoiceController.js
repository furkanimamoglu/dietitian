const path = require("path");

const InvoiceService = require(path.join(__dirname, "..", "Service", "InvoiceService"));
const {logError} = require(path.join(__dirname, "..", "Utils", "Logger"));

class invoiceController {

    static async getMyInvoices(req, res) {
        try {
            const dietitian_id = req.user.id;

            const result = await InvoiceService.getMyInvoices(dietitian_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientInvoices(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {client_id} = req.query;

            const result = await InvoiceService.getClientInvoices(dietitian_id, client_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async getClientInvoicesAsClient(req, res) {
        try {
            const client_id = req.user.id;

            const result = await InvoiceService.getClientInvoicesAsClient(client_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async deleteInvoice(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {invoice_id} = req.query;

            const result = await InvoiceService.deleteInvoice(dietitian_id, invoice_id);
            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async updateInvoice(req, res) {
        try {
            const dietitian_id = req.user.id;

            const {invoice_id, client_id, amount, paid_amount, status, package_id, issueDate, dueDate, description} = req.body;

            const result = await InvoiceService.updateInvoice(
                dietitian_id,
                invoice_id,
                {
                    client_id,
                    amount,
                    paid_amount,
                    status,
                    package_id,
                    issueDate,
                    dueDate,
                    description
                }
            );

            res.status(200).json(result);
        } catch (error) {
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }

    static async addInvoice(req, res) {
        try {
            const dietitian_id = req.user.id;

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
            logError(req, error);
            res.status(error.status || 500).json({
                showOnScreen: error.showOnScreen,
                message: error.message
            })
        }
    }
}

module.exports = invoiceController;