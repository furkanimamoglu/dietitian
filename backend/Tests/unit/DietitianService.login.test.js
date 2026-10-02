jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));

const jwt = require('jsonwebtoken');
const {Dietitian} = require('../../Model/MainModel');
const DietitianService = require('../../Service/DietitianService');
const {PASSWORD, fakeDietitian} = require('../helpers/factories');

describe('DietitianService.login', () => {
    test('doğru bilgilerle token üretir ve kayda yazar', async () => {
        const dietitian = fakeDietitian();
        Dietitian.findOne.mockResolvedValue(dietitian);

        const result = await DietitianService.login(dietitian.phoneNumber, PASSWORD);

        const payload = jwt.verify(result.token, process.env.JWT_SECRET);
        expect(payload).toMatchObject({id: 1, role: 'DIETITIAN'});
        expect(dietitian.update).toHaveBeenCalledWith({token: result.token});
    });

    test('yanlış şifrede hata fırlatır', async () => {
        Dietitian.findOne.mockResolvedValue(fakeDietitian());

        await expect(DietitianService.login(5551112233, 'yanlis')).rejects.toMatchObject({
            message: 'Hatalı giriş bilgileri.',
            status: 400
        });
    });

    test('kullanıcı bulunamazsa hata fırlatır', async () => {
        Dietitian.findOne.mockResolvedValue(null);

        await expect(DietitianService.login(5550000000, PASSWORD)).rejects.toMatchObject({
            message: 'Hatalı giriş bilgileri.'
        });
    });
});
