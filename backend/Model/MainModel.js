const path = require('path');
const sequelize = require(path.join(__dirname, '..', 'Utils', 'Database'));

const Dietitian = require(path.join(__dirname, 'Dietitian'));
const Client = require(path.join(__dirname, 'Client'));
const Exercise = require(path.join(__dirname, 'Exercise'));
const ExerciseCategory = require(path.join(__dirname, 'ExerciseCategory'));
const ExerciseAssignment = require(path.join(__dirname, 'ExerciseAssignment'));
const Appointment = require(path.join(__dirname, 'Appointment'));
const Anamnes = require(path.join(__dirname, 'Anamnes'));
const Invoice = require(path.join(__dirname, 'Invoice'));
const Notification = require(path.join(__dirname, 'Notification'));
const Message = require(path.join(__dirname, 'Message'));
const NutritionPlan = require(path.join(__dirname, 'NutritionPlan'));
const NutritionCategory = require(path.join(__dirname, 'NutritionCategory'));
const NutritionAssignment = require(path.join(__dirname, 'NutritionAssignment'));
const Recipe = require(path.join(__dirname, 'Recipe'));
const RecipeCategory = require(path.join(__dirname, 'RecipeCategory'));
const Notes = require(path.join(__dirname, 'Notes'));
const Package = require(path.join(__dirname, 'Package'));
const PackageItems = require(path.join(__dirname, 'PackageItems'));
const Measurement = require(path.join(__dirname, 'Measurement'));
const Water = require(path.join(__dirname, 'Water'));
const BloodTest = require(path.join(__dirname, 'BloodTest'));

Dietitian.hasMany(Client, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Client.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(Exercise, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Exercise.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(Recipe, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Recipe.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(Appointment, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Appointment.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(NutritionPlan, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
NutritionPlan.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(NutritionCategory, {
    foreignKey: 'dietitian_id',
    as: 'categories',
    onDelete: 'CASCADE',
});
NutritionCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

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

Client.hasMany(Appointment, {
    foreignKey: 'client_id',
});
Appointment.belongsTo(Client, {
    foreignKey: 'client_id',
});

Client.hasOne(Anamnes, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Anamnes.belongsTo(Client, {
    foreignKey: 'client_id',
});

Client.hasMany(Invoice, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Invoice.belongsTo(Client, {
    foreignKey: 'client_id',
});

Dietitian.hasMany(Invoice, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Invoice.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(Notes, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Notes.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Dietitian.hasMany(Message, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
});
Message.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
});

Client.hasMany(Message, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Message.belongsTo(Client, {
    foreignKey: 'client_id',
});

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

Dietitian.hasMany(RecipeCategory, {
    foreignKey: 'dietitian_id',
    as: 'recipeCategories',
    onDelete: 'CASCADE',
});
RecipeCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

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

Dietitian.hasMany(ExerciseCategory, {
    foreignKey: 'dietitian_id',
    as: 'exerciseCategories',
    onDelete: 'CASCADE',
});
ExerciseCategory.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id',
    as: 'dietitian',
});

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

Client.hasMany(ExerciseAssignment, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
    hooks: true,
});
ExerciseAssignment.belongsTo(Client, {
    foreignKey: 'client_id',
});

Client.hasMany(Measurement, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Measurement.belongsTo(Client, {
    foreignKey: 'client_id',
});

Package.hasMany(PackageItems, {
    foreignKey: 'package_id',
    onDelete: 'CASCADE',
    hooks: true
});
PackageItems.belongsTo(Package, {
    foreignKey: 'package_id'
});

Package.hasMany(Invoice, {
    foreignKey: 'package_id',
});
Invoice.belongsTo(Package, {
    foreignKey: 'package_id',
});

Dietitian.hasMany(Package, {
    foreignKey: 'dietitian_id',
    onDelete: 'CASCADE',
    hooks: true
});
Package.belongsTo(Dietitian, {
    foreignKey: 'dietitian_id'
});

Client.hasMany(Water, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE',
});
Water.belongsTo(Client, {
    foreignKey: 'client_id',
});

module.exports = {
    sequelize,
    Dietitian,
    Client,
    Appointment,
    Anamnes,
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
    RecipeCategory,
    Package,
    PackageItems,
    Measurement,
    Water,
    BloodTest
};
