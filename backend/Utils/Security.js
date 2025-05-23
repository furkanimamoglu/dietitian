const path = require('path');
const config = require(path.join(__dirname, '..', 'config.json'));
const jwt = require('jsonwebtoken');

/**
 * Security - All system Security, Authorization functions included.
 * @class
 * @author Furkan İmamoğlu
 */
class Security {

    /**
     * Security - Check token's user's role and returns it.
     * @params token - Token which starts with "Bearer ".
     * @author Furkan İmamoğlu
     */
    getPermissionFromToken(token) {
        token = token.replace('Bearer ', '');
        let user = jwt.verify(token, config.secretkey);

        if (!token) {
            return null;
        } else {
            return user.role;
        }
    }

    /**
     * Security - Check if user's permission is checkRole or not.
     * @params token - Token which starts with "Bearer ".
     * @returns boolean
     * @author Furkan İmamoğlu
     */
    checkUserPermission(token, checkRole) {
        let userRole = this.getPermissionFromToken(token);
        if (!userRole || !checkRole) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Security - Resolving user_id from Token.
     * @params token - Token which starts with "Bearer ".
     * @returns boolean
     * @author Furkan İmamoğlu
     */
    getUserIdFromToken(token) {
        try {
            if (!token) {
                return null;
            }

            token = token.replace('Bearer ', '');

            let solvedToken = jwt.verify(token, config.secretkey);

            return solvedToken.id;
        } catch (error) {
            return null;
        }
    }

    /**
     * Security - Resolving phoneNumber from Token.
     * @params token - Token which starts with "Bearer ".
     * @returns boolean
     * @author Furkan İmamoğlu
     */
    getPhoneNumberFromToken(token) {
        try {
            if (!token) {
                return null;
            }
            token = token.replace('Bearer ', '');

            let solvedToken = jwt.verify(token, config.secretkey);

            return solvedToken.phoneNumber;
        } catch (error) {
            return null;
        }
    }

}

module.exports = new Security();