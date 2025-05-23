const path = require('path');

const Exception = require(path.join(__dirname, '..', 'Exception', 'Exception'));
const { Invoice, Recipe, Client } = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const { Op } = require('sequelize');

class InvoiceService {

    static async getMyInvoices(dietitian_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        const now = new Date();

        await Invoice.update(
            {status: 'cancelled'},
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
            where: {dietitian_id},
            include: [{model: Client, attributes: ['name']}],
            order: [['dueDate', 'DESC']]
        });
    }

    static async getClientInvoices(dietitian_id, client_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        if (!client_id) {
            throw new Exception("Danışan belirtilmedi.", 404, true);
        }

        const invoices = await Invoice.findAll({
            where: {
                dietitian_id,
                client_id
            }
        });

        return invoices;
    }

    static async addInvoice(dietitian_id, invoiceData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }

        return await Invoice.create({
            ...invoiceData,
            dietitian_id: dietitian_id
        });
    }

    static async updateInvoice(dietitian_id, invoice_id, updateData) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }
        if (!invoice_id) {
            throw new Exception("Eksik fatura ID.", 400, true);
        }
        const invoice = await Invoice.findOne({
            where: {
                id: invoice_id,
                dietitian_id: dietitian_id
            }
        });

        if (!invoice) {
            throw new Exception("Fatura bulunamadı veya yetkisiz erişim.", 404, true);
        }

        return await invoice.update(updateData);
    }

    static async deleteInvoice(dietitian_id, invoice_id) {
        if (!dietitian_id) {
            throw new Exception("Yetkisiz Erişim.", 401, true);
        }
        if (!invoice_id) {
            throw new Exception("Eksik fatura ID.", 400, true);
        }
        const invoice = await Invoice.findOne({
            where: {
                id: invoice_id,
                dietitian_id: dietitian_id
            }
        });

        if (!invoice) {
            throw new Exception("Fatura bulunamadı veya yetkisiz erişim.", 404, true);
        }

        await invoice.destroy();

        return {success: true, message: "Fatura başarıyla silindi."};
    }

}

module.exports = InvoiceService;
