const amqp = require('amqplib');

let channel = null;
let connection = null;

async function connectRabbitMQ() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
        connection = await amqp.connect(url);
        channel = await connection.createChannel();
        await channel.assertQueue('user_activities', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ connection failed', error);
        // Do not throw just let it retry container restart, or if important, fail fast
        throw error;
    }
}

function getChannel() {
    return channel;
}

module.exports = {
    connectRabbitMQ,
    getChannel
};
