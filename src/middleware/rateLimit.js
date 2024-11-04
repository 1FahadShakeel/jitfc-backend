const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

exports.waitlistLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 60, // Limit each IP to 5 waitlist requests per hour
    message: 'Too many waitlist requests from this IP, please try again later.'
});