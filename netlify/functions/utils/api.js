const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('@/routes/userRoutes');
const waitlistRoutes = require('@/routes/waitlistRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

// Routes - Note: Don't include /.netlify/functions/api in the route path
app.use('/users', userRoutes);
app.use('/waitlist', waitlistRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

// Export the handler
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    // Keep the connection alive
    context.callbackWaitsForEmptyEventLoop = false;
    return await handler(event, context);
};