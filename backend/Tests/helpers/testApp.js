const path = require('path');
const express = require('express');

const {requestContext, notFound, errorHandler} = require(path.join(__dirname, '..', '..', 'Middleware', 'ErrorHandler'));
const dietitianRoutes = require(path.join(__dirname, '..', '..', 'Routes', 'dietitianRoutes'));
const clientRoutes = require(path.join(__dirname, '..', '..', 'Routes', 'clientRoutes'));

/**
 * app.js sunucuyu başlattığı ve DB'ye bağlandığı için testlerde aynı middleware
 * sırasıyla sadece auth ile ilgili route'ları içeren küçük bir app kurulur.
 */
function createTestApp() {
    const app = express();
    app.use(requestContext);
    app.use(express.json());
    app.use('/api/dietitian', dietitianRoutes);
    app.use('/api/client', clientRoutes);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}

module.exports = {createTestApp};
