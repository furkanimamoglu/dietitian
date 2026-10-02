/**
 * Model/MainModel yerine kullanılan sahte modeller.
 * Kullanım: jest.mock('../../Model/MainModel', () => require('../helpers/mockModels'));
 */
const model = () => ({
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
});

// Managed transaction taklidi: callback'i sahte bir transaction nesnesiyle çalıştırır.
const fakeTransaction = {id: 'test-transaction'};

module.exports = {
    fakeTransaction,
    sequelize: {
        transaction: jest.fn(async (callback) => callback(fakeTransaction))
    },
    Dietitian: model(),
    Client: model(),
    Notes: model(),
    DietitianSubPackage: model(),
    ExerciseAssignment: model(),
    Notification: model(),
    NutritionAssignment: model(),
    NutritionPlan: model(),
    Measurement: model(),
    RecipeAssignment: model(),
    Recipe: model(),
    RecipeCategory: model()
};
