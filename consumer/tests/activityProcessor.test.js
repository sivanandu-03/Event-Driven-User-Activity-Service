const { processEvent, Activity } = require('../src/services/activityProcessor');

describe('Activity Processor', () => {
    let saveSpy;

    beforeEach(() => {
        saveSpy = jest.spyOn(Activity.prototype, 'save').mockImplementation(async function () {
            return this;
        });
    });

    afterEach(() => {
        saveSpy.mockRestore();
    });

    it('should parse event and call database save', async () => {
        const mockEvent = {
            userId: "test-user-id",
            eventType: "test_event",
            timestamp: "2023-10-27T10:00:00Z",
            payload: { key: "value" }
        };

        const result = await processEvent(mockEvent);

        expect(result.id).toBeDefined();
        expect(result.userId).toBe(mockEvent.userId);
        expect(result.eventType).toBe(mockEvent.eventType);
        expect(result.payload).toEqual(mockEvent.payload);

        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});
