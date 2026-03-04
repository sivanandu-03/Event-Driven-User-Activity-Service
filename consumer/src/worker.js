const mongoose = require('mongoose');
const amqp = require('amqplib');
const activityProcessor = require('./services/activityProcessor');

async function startWorker() {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/activity_db';
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        const connection = await amqp.connect(rabbitMqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('user_activities', { durable: true });

        console.log('Waiting for messages in user_activities. To exit press CTRL+C');

        // Process up to 10 messages concurrently
        channel.prefetch(10);

        channel.consume('user_activities', async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = msg.content.toString();
                    const parsedData = JSON.parse(messageContent);

                    await activityProcessor.processEvent(parsedData);

                    // Acknowledge successfully processed message
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing message:', error);
                    // NACK and requeue message
                    channel.nack(msg, false, true);
                }
            }
        });

    } catch (error) {
        console.error('Worker failed to start:', error);
        process.exit(1);
    }
}

startWorker();
