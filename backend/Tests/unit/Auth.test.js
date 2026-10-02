const jwt = require('jsonwebtoken');
const {authorize} = require('../../Middleware/Auth');
const {tokenFor} = require('../helpers/factories');

function run(middleware, authorization) {
    const req = {headers: authorization ? {authorization} : {}};
    const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    const next = jest.fn();
    middleware(req, res, next);
    return {req, res, next};
}

describe('Auth middleware - authorize()', () => {
    test('geçerli Bearer token ile req.user set edilir ve next çağrılır', () => {
        const {req, next} = run(authorize('DIETITIAN'), `Bearer ${tokenFor({id: 1, role: 'DIETITIAN'})}`);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({id: 1, role: 'DIETITIAN'});
    });

    test('token yoksa 401 döner', () => {
        const {res, next} = run(authorize());

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('rol uyuşmazsa 401 döner', () => {
        const {res, next} = run(authorize('DIETITIAN'), `Bearer ${tokenFor({id: 10, role: 'CLIENT'})}`);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('farklı secret ile imzalanmış token reddedilir', () => {
        const forged = jwt.sign({id: 1, role: 'DIETITIAN'}, 'baska-secret');

        const {res} = run(authorize(), `Bearer ${forged}`);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});
