class Exception extends Error {
    status = 500;
    showOnScreen = false;

    constructor(message,status,showOnScreen) {
        super(message);
        this.status       = status        ? status        : 500;
        this.showOnScreen = showOnScreen  ? showOnScreen  : false;
    }
}

module.exports = Exception;