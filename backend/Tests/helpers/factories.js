const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PASSWORD = 'Sifre123';
const passwordHash = bcrypt.hashSync(PASSWORD, 4);

/**
 * Sequelize instance'ını taklit eden sahte kullanıcı kaydı.
 */
function fakeUser(fields) {
    const data = {password: passwordHash, token: null, ...fields};
    return {...data, dataValues: data, update: jest.fn().mockResolvedValue(true)};
}

const fakeDietitian = (fields = {}) => fakeUser({id: 1, phoneNumber: 5551112233, role: 'DIETITIAN', ...fields});
const fakeClient = (fields = {}) => fakeUser({id: 10, dietitian_id: 1, phoneNumber: 5554445566, role: 'CLIENT', status: 'Aktif', ...fields});

const tokenFor = (payload, options = {expiresIn: '1h'}) => jwt.sign(payload, process.env.JWT_SECRET, options);

module.exports = {PASSWORD, passwordHash, fakeDietitian, fakeClient, tokenFor};
