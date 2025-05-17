const Exception = require("../Exception/Exception");
const {Invoice} = require("../Model/MainModel");
const { Op } = require('sequelize');

class InvoiceService {


    async getMyInvoices(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const now = new Date();

        await Invoice.update(
            { status: 'cancelled' },
            {
                where: {
                    dietitian_id,
                    status: 'unpaid',
                    dueDate: {
                        [Op.lt]: now
                    }
                }
            }
        );

        return await Invoice.findAll({
            where: { dietitian_id },
            order: [['dueDate', 'DESC']]
        });
    }

}

module.exports = new InvoiceService();
