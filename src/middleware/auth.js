// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token, authorization denied'
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token is invalid'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                status: 'error',
                message: 'Account is not active'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Token is invalid'
        });
    }
};

module.exports = auth;