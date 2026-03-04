const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const activitySchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    timestamp: { type: Date, required: true },
    processedAt: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Avoid OverwriteModelError in test environments
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

async function processEvent(eventData) {
    try {
        const { userId, eventType, timestamp, payload } = eventData;

        const newActivity = new Activity({
            id: uuidv4(),
            userId,
            eventType,
            timestamp: new Date(timestamp),
            payload
        });

        await newActivity.save();
        console.log(`Processed activity id ${newActivity.id} for user ${userId}`);
        return newActivity;
    } catch (error) {
        console.error('Database connection or save error:', error);
        throw error;
    }
}

module.exports = { processEvent, Activity };
