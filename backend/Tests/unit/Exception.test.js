const Exception = require('../../Exception/Exception');

describe('Exception', () => {
    test('verilen status ve showOnScreen değerlerini taşır', () => {
        const error = new Exception('Hata', 400, true);

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Hata');
        expect(error.status).toBe(400);
        expect(error.showOnScreen).toBe(true);
    });

    test('varsayılan olarak 500 ve showOnScreen=false olur', () => {
        const error = new Exception('Hata');

        expect(error.status).toBe(500);
        expect(error.showOnScreen).toBe(false);
    });
});
