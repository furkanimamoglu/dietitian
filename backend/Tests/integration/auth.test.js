jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));

const request = require('supertest');
const {Dietitian, Client} = require('../../Model/MainModel');
const {createTestApp} = require('../helpers/testApp');
const {PASSWORD, fakeDietitian, fakeClient, tokenFor} = require('../helpers/factories');

const app = createTestApp();

describe('POST /api/dietitian/login', () => {
    test('doğru bilgilerle 200, token ve rol döner', async () => {
        Dietitian.findOne.mockResolvedValue(fakeDietitian());

        const res = await request(app)
            .post('/api/dietitian/login')
            .send({phoneNumber: 5551112233, password: PASSWORD});

        expect(res.status).toBe(200);
        expect(res.body.token).toEqual(expect.any(String));
        expect(res.body.role).toBe('DIETITIAN');
    });

    test('yanlış şifrede 400 döner', async () => {
        Dietitian.findOne.mockResolvedValue(fakeDietitian());

        const res = await request(app)
            .post('/api/dietitian/login')
            .send({phoneNumber: 5551112233, password: 'yanlis'});

        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });

    test('eksik parametrede 400 döner ve DB sorgulanmaz', async () => {
        const res = await request(app).post('/api/dietitian/login').send({phoneNumber: 5551112233});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({showOnScreen: true, message: 'Tüm parametreler doldurulmalıdır.'});
        expect(Dietitian.findOne).not.toHaveBeenCalled();
    });

    test('bozuk JSON gövdesinde 400 döner', async () => {
        const res = await request(app)
            .post('/api/dietitian/login')
            .set('Content-Type', 'application/json')
            .send('{bozuk');

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Geçersiz istek.');
    });
});

describe('POST /api/client/login', () => {
    test('doğru bilgilerle 200, token ve rol döner', async () => {
        Client.findOne.mockResolvedValue(fakeClient());

        const res = await request(app)
            .post('/api/client/login')
            .send({phoneNumber: 5554445566, password: PASSWORD});

        expect(res.status).toBe(200);
        expect(res.body.role).toBe('CLIENT');
        expect(res.body.token).toEqual(expect.any(String));
    });

    test('yanlış şifrede 400 döner', async () => {
        Client.findOne.mockResolvedValue(fakeClient());

        const res = await request(app)
            .post('/api/client/login')
            .send({phoneNumber: 5554445566, password: 'yanlis'});

        expect(res.status).toBe(400);
    });
});

describe('Korumalı endpoint erişimi', () => {
    test('token olmadan 401 döner', async () => {
        const res = await request(app).get('/api/client/getClientInfo');

        expect(res.status).toBe(401);
    });

    test('başka role ait token ile 401 döner', async () => {
        const res = await request(app)
            .get('/api/client/getClientInfo')
            .set('Authorization', `Bearer ${tokenFor({id: 1, role: 'DIETITIAN'})}`);

        expect(res.status).toBe(401);
    });

    test('geçerli token ile kullanıcı bilgisi döner', async () => {
        Client.findOne.mockResolvedValue({id: 10, name: 'Test Danışan'});

        const res = await request(app)
            .get('/api/client/getClientInfo')
            .set('Authorization', `Bearer ${tokenFor({id: 10, role: 'CLIENT'})}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({id: 10, name: 'Test Danışan'});
        expect(Client.findOne.mock.calls[0][0].where).toEqual({id: 10});
    });

    test('bilinmeyen endpoint 404 döner', async () => {
        const res = await request(app).get('/api/dietitian/yok');

        expect(res.status).toBe(404);
    });
});

describe('Login -> korumalı endpoint akışı', () => {
    test('login ile alınan token korumalı endpointte kullanılabilir', async () => {
        Client.findOne.mockResolvedValueOnce(fakeClient());
        const login = await request(app)
            .post('/api/client/login')
            .send({phoneNumber: 5554445566, password: PASSWORD});

        Client.findOne.mockResolvedValueOnce({id: 10});
        const res = await request(app)
            .get('/api/client/getClientInfo')
            .set('Authorization', `Bearer ${login.body.token}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(10);
    });
});
