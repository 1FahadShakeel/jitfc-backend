// src/routes/waitlistRoutes.js
const express = require('express');
const { check } = require('express-validator');
const { waitlistLimiter } = require('../middleware/rateLimit');
const { joinWaitlist, getWaitlistStats } = require('../controllers/waitlistController');

const router = express.Router();

router.post('/join',
    waitlistLimiter,
    [
        // Name validation
        check('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]*$/)
            .withMessage('Name can only contain letters and spaces'),

        // Email validation
        check('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail()
    ],
    joinWaitlist
);

router.get('/stats', getWaitlistStats);

module.exports = router;