// src/controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');
const logger = require('../config/logger');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { name, email, password, state } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            state,
            status: 'pending'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email
        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to Our Platform!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Welcome ${name}!</h1>
                        <p>Thank you for registering with us. We're excited to have you as a new member!</p>
                        <p>Your account has been successfully created and you can now access all our features.</p>
                        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                        <p>Best regards,<br>The Team</p>
                    </div>
                `
            });
        } catch (emailError) {
            logger.error('Failed to send welcome email:', emailError);
            // Continue execution even if email fails
        }

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                token,
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            status: 'success',
            data: {
                token,
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        logger.error('Profile fetch error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'state'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid updates'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.json({
            status: 'success',
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        logger.error('Profile update error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
};