const sequelize = require('../Utils/Database'); // Sequelize instance
const Dietitian = require('./Dietitian');
const Client = require('./Client');
const Exercise = require('./Exercise');
const ExerciseCategory = require('./ExerciseCategory');
const ExerciseAssignment = require('./ExerciseAssignment');
const Appointment = require('./Appointment');
const Anamnes = require('./Anamnes');
const AnamnesQuestion = require('./AnamnesQuestion');
const DietitianOption = require('./DietitianOption');
const Invoice = require('./Invoice');
const Notification = require('./Notification');
const Message = require('./Message');
const NutritionPlan = require('./NutritionPlan');
const NutritionCategory = require('./NutritionCategory');
const NutritionAssignment = require('./NutritionAssignment');
const Recipe = require('./Recipe');
const RecipeCategory = require('./RecipeCategory');
const Notes = require('./Notes');

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
    hooks: true
});
NutritionPlan.belongsTo(NutritionCategory, {
    foreignKey: 'category_id',
    as: 'category',
});

NutritionAssignment.belongsTo(NutritionPlan, {
    foreignKey: 'nutrition_plan_id',
    as: 'NutritionPlan'
});
NutritionPlan.hasMany(NutritionAssignment, {
    foreignKey: 'nutrition_plan_id',
    as: 'assignments',
    onDelete: 'CASCADE',
    hooks: true
});

Client.hasMany(NutritionAssignment, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
    hooks: true,
});
NutritionAssignment.belongsTo(Client, {
    foreignKey: 'client_id',
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

// Diyetisyen ve Notlar
Dietitian.hasMany(Notes, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Notes.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// Dietitian ve Message
Dietitian.hasMany(Message, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Message.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

// Client ve Message
Client.hasMany(Message, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Message.belongsTo(Client, {
    foreignKey: 'client_id',
});

// Tarifler ve Tarif Kategorisi
RecipeCategory.hasMany(Recipe, {
    foreignKey: 'category_id',
    as: 'recipe',
    onDelete: 'CASCADE',
    hooks: true
});
Recipe.belongsTo(RecipeCategory, {
    foreignKey: 'category_id',
    as: 'category',
});

// Diyetisyen ve Tarif Kategorisi
Dietitian.hasMany(RecipeCategory, {
    foreignKey: 'dietitian_id',
    as: 'recipeCategories',
    onDelete: 'CASCADE',
});
RecipeCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

// Egzersiz ve Egzersiz Kategorisi
ExerciseCategory.hasMany(Exercise, {
    foreignKey: 'category_id',
    as: 'exercise',
    onDelete: 'CASCADE',
    hooks: true
});
Exercise.belongsTo(ExerciseCategory, {
    foreignKey: 'category_id',
    as: 'category',
});

// Dietitian ve Exercise Category
Dietitian.hasMany(ExerciseCategory, {
    foreignKey: 'dietitian_id',
    as: 'exerciseCategories',
    onDelete: 'CASCADE',
});
ExerciseCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

// Exercise and ExerciseAssignment relationship
ExerciseAssignment.belongsTo(Exercise, {
    foreignKey: 'exercise_id',
    as: 'Exercise'
});
Exercise.hasMany(ExerciseAssignment, {
    foreignKey: 'exercise_id',
    as: 'assignments',
    onDelete: 'CASCADE',
    hooks: true
});

// Client and ExerciseAssignment relationship
Client.hasMany(ExerciseAssignment, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
    hooks: true,
});
ExerciseAssignment.belongsTo(Client, {
    foreignKey: 'client_id',
});

module.exports = {
    sequelize,
    Dietitian,
    Client,
    Appointment,
    Anamnes,
    AnamnesQuestion,
    DietitianOption,
    Invoice,
    Notification,
    Message,
    Exercise,
    ExerciseCategory,
    ExerciseAssignment,
    NutritionPlan,
    NutritionCategory,
    NutritionAssignment,
    Notes,
    Recipe,
    RecipeCategory
};
