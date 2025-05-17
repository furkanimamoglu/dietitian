const InvoiceService = require("../Service/invoiceService");
const Security = require("../Utils/Security");

class invoiceController {

    async getMyInvoices(req, res) {
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

}

module.exports = new invoiceController();