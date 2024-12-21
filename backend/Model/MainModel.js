const sequelize = require('../Utils/Database');

const Dietitian = require('./Dietitian');
const Client = require('./Client');
const Exercise = require('./Exercise');
const Recipe = require('./Recipe');
const Appointment = require('./Appointment');
const AnamnesQuestion = require('./AnamnesQuestion');
const DietitianOption = require('./DietitianOption');
const Anamnesis = require('./Anamnes');
const Invoice = require('./Invoice');
const Anamnes = require("./Anamnes");


// Dietitian Relations
Dietitian.hasMany(Client, {
    foreignKey: "dietitian_id"
});
Dietitian.hasMany(Exercise, {
    foreignKey: "dietitian_id"
});
Dietitian.hasMany(Recipe, {
    foreignKey: "dietitian_id"
});
Dietitian.hasMany(Appointment,{
    foreignKey: "dietitian_id"
});
Dietitian.hasMany(AnamnesQuestion,{
    foreignKey: "dietitian_id"
});
Dietitian.hasOne(DietitianOption, {
    foreignKey: "dietitian_id"
});

// Client Relations
Client.hasMany(Anamnesis, {
    foreignKey: "client_id"
});
Client.hasMany(Invoice, {
    foreignKey: "client_id"
});

// Anamnes Question Relations
AnamnesQuestion.hasMany(Anamnes,{
    foreignKey: "anamnes_question_id"
});


module.exports = {
    sequelize,
    Dietitian,
    Client,
    Exercise,
    Recipe,
    Appointment,
    AnamnesQuestion,
    DietitianOption,
    Anamnesis,
    Invoice
};