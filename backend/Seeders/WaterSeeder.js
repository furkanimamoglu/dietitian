const path = require('path');

const {Water} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {randomInt, pick, dateOnly} = require(path.join(__dirname, 'SeedUtils'));

const DAYS = 14;
const GLASS_SIZES = [200, 250, 300, 330, 500];

/**
 * WaterSeeder - Aktif danışanlar için son 14 günün su tüketimi kayıtları (günde birkaç bardak).
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Su Takibi',

    async run(ctx) {
        const rows = [];

        for (const client of ctx.activeClients) {
            for (let day = DAYS - 1; day >= 0; day--) {
                // Bugün gün henüz bitmediği için daha az kayıt.
                const entries = day === 0 ? randomInt(2, 3) : randomInt(4, 8);
                for (let i = 0; i < entries; i++) {
                    rows.push({
                        client_id: client.id,
                        date: dateOnly(-day),
                        amount_ml: pick(GLASS_SIZES)
                    });
                }
            }
        }

        await Water.bulkCreate(rows, {transaction: ctx.transaction});
        return rows.length;
    }
};
