const config = {
    environment: "dev",

    dev: {
        app_scheme: "diyetia",
        apiUrl: 'http://172.20.10.2:3000/api'
    },

    prod: {
        app_scheme: "diyetia",
        apiUrl: 'https://diyetia.com/api'
    }

};

export default config;