/**
 * Login regresyon testleri - bozulmaması gereken login davranışları.
 * Login akışında yapılan her değişiklikten sonra çalıştırılmalı: npm run test:regression
 */
jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const {Dietitian, Client} = require('../../Model/MainModel');
const {createTestApp} = require('../helpers/testApp');
const {PASSWORD, fakeDietitian, fakeClient, tokenFor} = require('../helpers/factories');

const app = createTestApp();

const loginEndpoints = [
    {name: 'dietitian', url: '/api/dietitian/login', model: Dietitian, fake: fakeDietitian},
    {name: 'client', url: '/api/client/login', model: Client, fake: fakeClient}
];

describe.each(loginEndpoints)('$name login regresyonu', ({url, model, fake}) => {
    // Bcrypt geçişi: DB'de düz metin şifre kalmışsa aynı düz metinle giriş yapılamamalı.
    test('düz metin (hash olmayan) şifre ile giriş yapılamaz', async () => {
        model.findOne.mockResolvedValue(fake({password: PASSWORD}));

        const res = await request(app).post(url).send({phoneNumber: 5551112233, password: PASSWORD});

        expect(res.status).not.toBe(200);
        expect(res.body.token).toBeUndefined();
    });

    // Kayıtlı numaralar tahmin edilememeli: yanlış numara ve yanlış şifre aynı yanıtı vermeli.
    test('olmayan kullanıcı ve yanlış şifre aynı yanıtı verir', async () => {
        model.findOne.mockResolvedValueOnce(null);
        const unknownUser = await request(app).post(url).send({phoneNumber: 5550000000, password: PASSWORD});

        model.findOne.mockResolvedValueOnce(fake());
        const wrongPassword = await request(app).post(url).send({phoneNumber: 5551112233, password: 'yanlis'});

        expect(unknownUser.status).toBe(wrongPassword.status);
        expect(unknownUser.body).toEqual(wrongPassword.body);
    });

    // Yanıtta sadece token ve rol olmalı, şifre hash'i gibi alanlar dışarı sızmamalı.
    test('başarılı yanıtta sadece token ve role bulunur', async () => {
        model.findOne.mockResolvedValue(fake());

        const res = await request(app).post(url).send({phoneNumber: 5551112233, password: PASSWORD});

        expect(res.status).toBe(200);
        expect(Object.keys(res.body).sort()).toEqual(['role', 'token']);
        expect(JSON.stringify(res.body)).not.toContain('$2');
    });

    test('token payload içinde şifre yok ve 30 gün geçerli', async () => {
        model.findOne.mockResolvedValue(fake());

        const res = await request(app).post(url).send({phoneNumber: 5551112233, password: PASSWORD});
        const payload = jwt.decode(res.body.token);

        expect(payload.password).toBeUndefined();
        expect(payload.exp - payload.iat).toBe(30 * 24 * 60 * 60);
    });

    test('veritabanı hatasında token dönmez', async () => {
        model.findOne.mockRejectedValue(new Error('connection refused'));

        const res = await request(app).post(url).send({phoneNumber: 5551112233, password: PASSWORD});

        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.token).toBeUndefined();
    });
});

describe('Token regresyonu', () => {
    test('"Bearer" öneki olmadan gönderilen token da kabul edilir', async () => {
        Client.findOne.mockResolvedValue({id: 10});

        const res = await request(app)
            .get('/api/client/getClientInfo')
            .set('Authorization', tokenFor({id: 10, role: 'CLIENT'}));

        expect(res.status).toBe(200);
    });

    test('süresi dolmuş token reddedilir', async () => {
        const expired = tokenFor({id: 10, role: 'CLIENT'}, {expiresIn: -10});

        const res = await request(app)
            .get('/api/client/getClientInfo')
            .set('Authorization', `Bearer ${expired}`);

        expect(res.status).toBe(401);
    });

    test('pasif danışan giriş yapamaz', async () => {
        Client.findOne.mockResolvedValue(fakeClient({status: 'Pasif'}));

        const res = await request(app).post('/api/client/login').send({phoneNumber: 5554445566, password: PASSWORD});

        expect(res.status).not.toBe(200);
        expect(res.body.token).toBeUndefined();
    });
});
