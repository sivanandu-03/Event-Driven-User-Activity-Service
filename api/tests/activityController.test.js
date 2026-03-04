const request = require('supertest');
const app = require('../src/server');
const rabbitmq = require('../src/rabbitmq');

jest.mock('../src/rabbitmq', () => ({
    connectRabbitMQ: jest.fn(),
    getChannel: jest.fn()
}));

describe('POST /api/v1/activities', () => {
    let mockChannel;

    beforeEach(() => {
        mockChannel = {
            sendToQueue: jest.fn().mockReturnValue(true)
        };
        rabbitmq.getChannel.mockReturnValue(mockChannel);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 202 for valid payload', async () => {
        const payload = {
            userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            eventType: "user_login",
            timestamp: "2023-10-27T10:00:00Z",
            payload: {
                ipAddress: "192.168.1.1"
            }
        };

        const res = await request(app)
            .post('/api/v1/activities')
            .send(payload);

        expect(res.status).toBe(202);
        expect(res.body).toEqual({ message: 'Event successfully received and queued.' });
        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/v1/activities')
            .send({
                userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
        expect(mockChannel.sendToQueue).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid timestamp', async () => {
        const payload = {
            userId: "a1b2c3d4",
            eventType: "login",
            timestamp: "invalid-date",
            payload: {}
        };
        const res = await request(app).post('/api/v1/activities').send(payload);
        expect(res.status).toBe(400);
    });
});
