// functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../src/app'); // Your existing Express app

// Wrap your Express app
const handler = serverless(app);

// Export the handler
exports.handler = async (event, context) => {
    // Keep the connection alive
    context.callbackWaitsForEmptyEventLoop = false;

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    return await handler(event, context);
};