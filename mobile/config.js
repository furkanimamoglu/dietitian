const config = {
    environment: "dev",

    dev: {
        app_scheme: "diyetia",
        apiUrl: 'http://192.168.1.135:3000/api'
    },

    prod: {
        app_scheme: "diyetia",
        apiUrl: 'https://diyetia.com/api'
    }

};

export default config;