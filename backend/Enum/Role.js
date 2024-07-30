/**
 * @enum
 * @readonly
 * @type {Readonly<{ADMIN: string, USER: string, MODERATOR: string}>}
 */
const Role = Object.freeze({
    CLIENT : "CLIENT",
    DIETITIAN : "DIETITIAN",
    ADMIN : "ADMIN"
});

module.exports = Role;