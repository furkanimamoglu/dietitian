const path = require('path');

const {Invoice} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {randomInt, dateAt} = require(path.join(__dirname, 'SeedUtils'));

/**
 * InvoiceSeeder - Son 5 aya yayılmış faturalar; ödenmiş, kısmi ödenmiş, ödenmemiş ve iptal.
 * Finans sayfasındaki grafik ve özetlerin dolu görünmesi için tarihler aylara dağıtılır.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Fatura',

    async run(ctx) {
        const rows = [];

        ctx.clients.forEach((client, index) => {
            // Her danışana 1-3 fatura; en eskisi daha önceki aylarda.
            const count = client.status === 'Aktif' ? randomInt(1, 3) : 1;

            for (let i = 0; i < count; i++) {
                const pkg = ctx.packages[(index + i) % ctx.packages.length];
                const amount = Number(pkg.price);
                const daysAgo = randomInt(i * 45, i * 45 + 40);
                const issueDate = dateAt(-daysAgo, 12, 0);
                const dueDate = dateAt(-daysAgo + 14, 12, 0);

                // En yeni fatura bazen açık kalır; eski faturalar çoğunlukla ödenmiş.
                let status = 'paid';
                let paid_amount = amount;
                if (i === 0 && index % 4 === 1) {
                    status = 'partiallypaid';
                    paid_amount = Math.round(amount / 2);
                } else if (i === 0 && index % 4 === 2) {
                    status = 'unpaid';
                    paid_amount = 0;
                } else if (client.status === 'Pasif') {
                    status = 'cancelled';
                    paid_amount = 0;
                }

                rows.push({
                    dietitian_id: ctx.dietitian.id,
                    client_id: client.id,
                    package_id: pkg.id,
                    amount,
                    paid_amount,
                    status,
                    issueDate,
                    dueDate,
                    description: `${pkg.name} - ${client.name}`,
                    createdAt: issueDate,
                    updatedAt: issueDate
                });
            }
        });

        await Invoice.bulkCreate(rows, {transaction: ctx.transaction, silent: true});
        return rows.length;
    }
};
