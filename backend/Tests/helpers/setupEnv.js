// Testler gerçek .env yerine bu sabit değerlerle çalışır (dotenv var olan değişkenleri ezmez).
// Veritabanı testlerde mock'lanır, bu değerlerle hiçbir dış servise bağlanılmaz.
Object.assign(process.env, {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    SEED_ON_START: 'false',
    DDL: 'update',
    JWT_SECRET: 'test-secret',
    DB_HOST: 'localhost',
    DB_NAME: 'test_db',
    DB_USER: 'test',
    DB_PASSWORD: 'test',
    MAIL_ADDRESS: 'test@example.com',
    MAIL_APP_PASSWORD: 'test',
    S3_ACCESS_KEY_ID: 'test',
    S3_SECRET_ACCESS_KEY: 'test'
});
