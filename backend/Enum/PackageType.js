/**
 * @enum
 * @readonly
 * @type {Readonly<{SEANS: string, AYLIK: string, UCAYLIK: string, ALTIAYLIK: string, YILLIK: string}>}
 */
const PackageType = Object.freeze({
    SEANS: "SEANS",
    AYLIK: "AYLIK",
    UCAYLIK: "UCAYLIK",
    ALTIAYLIK: "ALTIAYLIK",
    YILLIK: "YILLIK",
});

module.exports = PackageType;