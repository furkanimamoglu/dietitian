// config.js
const config = {
    environment: "dev",

    dev: {
        apiUrl: 'http://localhost:3000/',
        websiteName: "WebsiteName",
        footerText: "2024 Development Website"
    },

    prod: {
        apiUrl: '',
        websiteName: "Diyetisyenim",
        footerText: "2024 Diyetisyen Uygulaması"
    }
};

export default config;