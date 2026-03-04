const Joi = require('joi');
const { getChannel } = require('../rabbitmq');

// Input validation schema
const schema = Joi.object({
    userId: Joi.string().required(),
    eventType: Joi.string().required().min(1),
    timestamp: Joi.string().isoDate().required(),
    payload: Joi.object().required()
});

async function ingestActivity(req, res) {
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const channel = getChannel();
        if (!channel) {
            console.error('Channel unavailable');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const messageBuffer = Buffer.from(JSON.stringify(value));
        const published = channel.sendToQueue('user_activities', messageBuffer, { persistent: true });

        if (published) {
            return res.status(202).json({ message: 'Event successfully received and queued.' });
        } else {
            // RabbitMQ queue full or socket closed unexpectedly
            console.error('RabbitMQ buffer full');
            return res.status(500).json({ error: 'Internal Server Error: Message not queued' });
        }
    } catch (err) {
        console.error('Failed to publish message:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    ingestActivity
};
