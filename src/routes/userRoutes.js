// src/routes/userRoutes.js
const express = require('express');
const { check } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    check('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    check('state')
        .trim()
        .notEmpty()
        .withMessage('State is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', [
    check('email').isEmail().normalizeEmail(),
    check('password').notEmpty()
], login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

module.exports = router;