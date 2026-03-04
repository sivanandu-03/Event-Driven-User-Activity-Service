const rateLimiter = require('../src/middlewares/rateLimiter');

describe('Rate Limiter', () => {
    let req, res, next;

    beforeEach(() => {
        req = { ip: '127.0.0.1', headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn()
        };
        next = jest.fn();
    });

    it('should allow requests under the limit', () => {
        for (let i = 0; i < 50; i++) {
            rateLimiter(req, res, next);
            expect(next).toHaveBeenCalledTimes(i + 1);
        }
    });

    it('should block requests over the limit and set Retry-After', () => {
        req.ip = '192.168.1.2';
        for (let i = 0; i < 50; i++) {
            rateLimiter(req, res, next);
        }

        // 51st request should be blocked
        rateLimiter(req, res, next);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Too Many Requests' }));
    });
});
