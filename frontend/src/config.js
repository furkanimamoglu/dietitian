const config = {
    environment: "dev",

    dev: {
        apiUrl: 'http://localhost:3000/api',
        imageUrl: 'http://localhost:3000/uploads/'
    },

    prod: {
        apiUrl: 'https://diyetia.com/api',
        imageUrl: 'https://diyetia.com/uploads/'
    }
};

export default config;