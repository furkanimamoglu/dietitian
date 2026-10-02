jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));

const {sequelize, fakeTransaction, Client, NutritionAssignment} = require('../../Model/MainModel');
const NutritionService = require('../../Service/NutritionService');

const transactionOption = expect.objectContaining({transaction: fakeTransaction});

describe('assignCustomPlanToClient - transaction', () => {
    test('danışan satırı kilitlenir, kontrol ve kayıt aynı transaction ile yapılır', async () => {
        Client.findByPk.mockResolvedValue({id: 10});
        NutritionAssignment.findOne.mockResolvedValue(null);
        NutritionAssignment.create.mockResolvedValue({id: 5});

        await NutritionService.assignCustomPlanToClient(10, {}, '2026-10-01', '2026-10-07', '');

        expect(sequelize.transaction).toHaveBeenCalledTimes(1);
        expect(Client.findByPk).toHaveBeenCalledWith(10, {lock: true, transaction: fakeTransaction});
        expect(NutritionAssignment.findOne).toHaveBeenCalledWith(transactionOption);
        expect(NutritionAssignment.create).toHaveBeenCalledWith(expect.any(Object), transactionOption);
    });

    test('çakışan plan varsa 409 fırlatılır ve kayıt oluşturulmaz', async () => {
        Client.findByPk.mockResolvedValue({id: 10});
        NutritionAssignment.findOne.mockResolvedValue({id: 3});

        await expect(NutritionService.assignCustomPlanToClient(10, {}, '2026-10-01', '2026-10-07', ''))
            .rejects.toMatchObject({status: 409});
        expect(NutritionAssignment.create).not.toHaveBeenCalled();
    });
});
