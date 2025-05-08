const sequelize = require('../Utils/Database'); // Sequelize instance
const Dietitian = require('./Dietitian');
const Client = require('./Client');
const Exercise = require('./Exercise');
const Recipe = require('./Recipe');
const Appointment = require('./Appointment');
const Anamnes = require('./Anamnes');
const AnamnesQuestion = require('./AnamnesQuestion');
const DietitianOption = require('./DietitianOption');
const NutritionPlan = require('./NutritionPlan');
const NutritionCategory = require('./NutritionCategory');
const Invoice = require('./Invoice');
const Notification = require('./Notification');

// 1. Dietitian ve Client
Dietitian.hasMany(Client, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Client.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 2. Dietitian ve Exercise
Dietitian.hasMany(Exercise, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Exercise.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 3. Dietitian ve Recipe
Dietitian.hasMany(Recipe, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Recipe.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 4. Dietitian ve Appointment
Dietitian.hasMany(Appointment, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Appointment.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 5. Dietitian ve NutritionPlan
Dietitian.hasMany(NutritionPlan, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
NutritionPlan.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 6. Dietitian ve DietitianOption
Dietitian.hasOne(DietitianOption, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
DietitianOption.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// 7. Dietitian ve NutritionCategory
Dietitian.hasMany(NutritionCategory, {
    foreignKey: 'dietitian_id',
    as: 'categories',
    onDelete: 'CASCADE',
});
NutritionCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

// 8. NutritionCategory ve NutritionPlan
NutritionCategory.hasMany(NutritionPlan, {
    foreignKey: 'category_id',
    as: 'nutritionPlans',
    onDelete: 'CASCADE',
});
NutritionPlan.belongsTo(NutritionCategory, {
    foreignKey: 'category_id',
    as: 'category',
});

// 9. Client ve Appointment
Client.hasMany(Appointment, {
    foreignKey: 'client_id',
});
Appointment.belongsTo(Client, {
    foreignKey: 'client_id',
});

// 10. Client ve Anamnes
Client.hasMany(Anamnes, {
    foreignKey: 'client_id',
});
Anamnes.belongsTo(Client, {
    foreignKey: 'client_id',
});

// 11. Client ve Invoice
Client.hasMany(Invoice, {
    foreignKey: 'client_id',
});
Invoice.belongsTo(Client, {
    foreignKey: 'client_id',
});

// 12. AnamnesQuestion ve Anamnes
AnamnesQuestion.hasMany(Anamnes, {
    foreignKey: 'anamnes_question_id',
    onDelete: 'CASCADE',
});
Anamnes.belongsTo(AnamnesQuestion, {
    foreignKey: 'anamnes_question_id',
});

module.exports = {
    sequelize,
    Dietitian,
    Client,
    Exercise,
    Recipe,
    Appointment,
    Anamnes,
    AnamnesQuestion,
    DietitianOption,
    NutritionPlan,
    NutritionCategory,
    Invoice,
    Notification
};
