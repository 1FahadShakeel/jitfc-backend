const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('../../src/routes/userRoutes');
const waitlistRoutes = require('../../src/routes/waitlistRoutes');

const app = express();

// MongoDB connection instance
let cachedDb = null;

// MongoDB connection function
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        cachedDb = db;
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/users', userRoutes);
app.use('/waitlist', waitlistRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            details: Object.values(err.errors).map(error => error.message)
        });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            status: 'error',
            message: 'Duplicate entry found'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// Serverless handler
const handler = serverless(app);
module.exports.handler = async (event, context) => {
    // Keep the connection alive
    context.callbackWaitsForEmptyEventLoop = false;

    // Connect to database before handling request
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: 'Database connection failed'
            })
        };
    }

    return await handler(event, context);
};