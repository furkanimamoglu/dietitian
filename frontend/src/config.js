// config.js
const config = {
    environment: "prod",

    dev: {
        apiUrl: 'http://localhost:3000',
        websiteName: "Diyetisyenim",
        footerText: "2024 Diyetisyenim"
    },

    prod: {
        apiUrl: 'http://164.92.252.201:3000',
        websiteName: "Diyetisyenim",
        footerText: "2024 Diyetisyen Uygulaması"
    }
};

export default config;