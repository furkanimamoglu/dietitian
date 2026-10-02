const path = require('path');

const {Appointment} = require(path.join(__dirname, '..', 'Model', 'MainModel'));
const {pick, randomInt, dateAt} = require(path.join(__dirname, 'SeedUtils'));

const DURATION_MINUTES = 45;
const HOURS = [9, 10, 11, 13, 14, 15, 16, 17];

const PAST_NOTES = ['Kontrol görüşmesi', 'Vücut analizi yapıldı', 'Plan güncellendi', 'Aylık değerlendirme', 'İlk görüşme'];
const UPCOMING_NOTES = ['Kontrol görüşmesi', 'Vücut analizi', 'Beslenme planı revizyonu', 'Online görüşme'];
const PENDING_NOTES = ['Plan hakkında görüşmek istiyorum', 'Tatil öncesi kontrol', 'Kan tahlili sonuçlarını getireceğim'];

function appointment(ctx, client, dayOffset, hour, minute, status, note) {
    const start = dateAt(dayOffset, hour, minute);
    return {
        dietitian_id: ctx.dietitian.id,
        client_id: client.id,
        start,
        end: new Date(start.getTime() + DURATION_MINUTES * 60 * 1000),
        status,
        note
    };
}

/**
 * AppointmentSeeder - Geçmiş, bugünkü, yaklaşan, onay bekleyen ve iptal edilmiş randevular.
 * Dashboard'daki "bugünkü randevular" ve "onay bekleyenler" kartları dolu görünür.
 * @author Furkan İmamoğlu
 */
module.exports = {
    name: 'Randevu',

    async run(ctx) {
        const rows = [];
        const clients = ctx.activeClients;

        clients.forEach((client, index) => {
            // Geçmiş: her danışana 2-4 onaylı randevu, 2-3 hafta arayla.
            const pastCount = randomInt(2, 4);
            for (let i = 1; i <= pastCount; i++) {
                rows.push(appointment(ctx, client, -i * randomInt(14, 21), pick(HOURS), 0, 'approved', pick(PAST_NOTES)));
            }

            // Yaklaşan: önümüzdeki 2-20 gün içinde onaylı randevu.
            rows.push(appointment(ctx, client, randomInt(2, 20), HOURS[index % HOURS.length], 0, 'approved', pick(UPCOMING_NOTES)));
        });

        // Bugün: ilk 4 danışan (biri günün erken saatinde, geçmiş görünsün diye).
        [[9, 0], [11, 30], [14, 0], [16, 30]].forEach(([hour, minute], index) => {
            rows.push(appointment(ctx, clients[index], 0, hour, minute, 'approved', pick(UPCOMING_NOTES)));
        });

        // Onay bekleyen: danışanların uygulamadan talep ettiği randevular.
        [4, 5, 6].forEach((clientIndex, i) => {
            rows.push(appointment(ctx, clients[clientIndex], i + 1, 10 + i * 2, 0, 'pending', PENDING_NOTES[i]));
        });

        // İptal edilmiş randevular.
        rows.push(appointment(ctx, clients[7], -5, 15, 0, 'cancelled', 'Danışan iptal etti'));
        rows.push(appointment(ctx, clients[1], 3, 17, 0, 'cancelled', 'Diyetisyen tarafından ertelendi'));

        await Appointment.bulkCreate(rows, {transaction: ctx.transaction});
        return rows.length;
    }
};
