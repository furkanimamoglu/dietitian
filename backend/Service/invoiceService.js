const Exception = require("../Exception/Exception");
const {Invoice} = require("../Model/MainModel");

class InvoiceService {

    async getMyInvoices(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Invoice.findAll({
            where: {dietitian_id},
            order: [['dueDate', 'DESC']]
        });
    }
}

module.exports = new InvoiceService();
