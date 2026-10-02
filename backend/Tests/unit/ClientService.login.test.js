jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));

const jwt = require('jsonwebtoken');
const {Client} = require('../../Model/MainModel');
const ClientService = require('../../Service/ClientService');
const {PASSWORD, fakeClient} = require('../helpers/factories');

describe('ClientService.login', () => {
    test('doğru bilgilerle token üretir', async () => {
        const client = fakeClient();
        Client.findOne.mockResolvedValue(client);

        const result = await ClientService.login(client.phoneNumber, PASSWORD);

        const payload = jwt.verify(result.token, process.env.JWT_SECRET);
        expect(payload).toMatchObject({id: 10, dietitian_id: 1, role: 'CLIENT'});
        expect(client.update).toHaveBeenCalledWith({token: result.token});
    });

    test('yanlış şifrede hata fırlatır', async () => {
        Client.findOne.mockResolvedValue(fakeClient());

        await expect(ClientService.login(5554445566, 'yanlis')).rejects.toMatchObject({
            message: 'Hatalı giriş bilgileri.'
        });
    });

    test('pasif danışan giriş yapamaz', async () => {
        const client = fakeClient({status: 'Pasif'});
        Client.findOne.mockResolvedValue(client);

        await expect(ClientService.login(client.phoneNumber, PASSWORD)).rejects.toThrow(/pasif/);
        expect(client.update).not.toHaveBeenCalled();
    });
});
