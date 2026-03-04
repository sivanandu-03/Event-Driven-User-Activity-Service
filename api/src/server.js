const express = require('express');
const activityRoutes = require('./routes/activityRoutes');
const { connectRabbitMQ } = require('./rabbitmq');

const app = express();
app.use(express.json());

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api/v1', activityRoutes);

const PORT = process.env.API_PORT || 3000;

async function startServer() {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// For testing purposes we only want to start the server when this file is executed directly
if (require.main === module) {
  startServer();
}

module.exports = app;
