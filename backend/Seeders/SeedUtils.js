const moment = require('moment');

/**
 * SeedUtils - Seeder'ların ortak yardımcıları.
 * Rastgelelik sabit bir seed ile üretilir; seeder her çalıştığında aynı veriyi oluşturur.
 * @author Furkan İmamoğlu
 */

// mulberry32 - Seed'li, deterministik rastgele sayı üreteci.
let state = 20251002;

function random() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * min ve max dahil tam sayı.
 */
function randomInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Diziden rastgele bir eleman.
 */
function pick(list) {
    return list[Math.floor(random() * list.length)];
}

/**
 * Diziden tekrarsız count adet eleman.
 */
function pickMany(list, count) {
    const copy = [...list];
    const result = [];
    while (copy.length && result.length < count) {
        result.push(copy.splice(Math.floor(random() * copy.length), 1)[0]);
    }
    return result;
}

/**
 * Bugüne göre gün kaydırılmış tarih (DATEONLY için 'YYYY-MM-DD').
 */
function dateOnly(dayOffset) {
    return moment().add(dayOffset, 'days').format('YYYY-MM-DD');
}

/**
 * Bugüne göre gün kaydırılmış, belirli saatte Date.
 */
function dateAt(dayOffset, hour = 9, minute = 0) {
    return moment().add(dayOffset, 'days').hour(hour).minute(minute).second(0).millisecond(0).toDate();
}

module.exports = {random, randomInt, pick, pickMany, dateOnly, dateAt};
