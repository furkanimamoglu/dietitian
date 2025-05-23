const config = require('../config.json');

class SocketManager {

    constructor(io) {
        this.io = io;
    }
}

module.exports = SocketManager;