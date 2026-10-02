const path = require('path');
const jwt = require('jsonwebtoken');

const config = require(path.join(__dirname, '..', 'config.json'));

/**
 * Auth Middleware - Resolves the Bearer token from Authorization header and puts the user on req.user.
 * If roles are given, user's role must be one of them.
 * @param {...string} roles - Allowed roles (Enum/Role). Empty means any authenticated user.
 * @returns Express middleware
 * @author Furkan İmamoğlu
 */
function authorize(...roles) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : header;

        let user;
        try {
            user = token ? jwt.verify(token, config.secretkey) : null;
        } catch (error) {
            user = null;
        }

        if (!user || !user.id || (roles.length && !roles.includes(user.role))) {
            return res.status(401).json({
                showOnScreen: true,
                message: "Yetkisiz erişim."
            });
        }

        req.user = {id: user.id, role: user.role};
        next();
    };
}

module.exports = {authorize};
