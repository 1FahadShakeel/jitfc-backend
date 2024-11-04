
// src/controllers/waitlistController.js
const WaitlistUser = require('../models/WaitlistUser');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../config/email');
const logger = require('../config/logger');

exports.joinWaitlist = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { name, email } = req.body;

        // Check if email already exists
        const existingUser = await WaitlistUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered in waitlist'
            });
        }

        // Create new waitlist user
        const waitlistUser = new WaitlistUser({
            name,
            email
        });
        await waitlistUser.save();

        // Send welcome email
        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to Our Waitlist!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>Welcome ${name}!</h1>
                        <p>Thank you for joining our waitlist. We're excited to have you with us!</p>
                        <p>We'll keep you updated on our progress and let you know when you can access the platform.</p>
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
            message: 'Successfully joined waitlist',
            data: {
                name: waitlistUser.name,
                email: waitlistUser.email,
                joinedAt: waitlistUser.joinedAt,
                status: waitlistUser.status
            }
        });

    } catch (error) {
        logger.error('Waitlist join error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
};

exports.getWaitlistStats = async (req, res) => {
    try {
        const stats = await WaitlistUser.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    users: { $push: { name: '$name', email: '$email', joinedAt: '$joinedAt' } }
                }
            }
        ]);

        const formattedStats = {
            total: await WaitlistUser.countDocuments(),
            byStatus: stats.reduce((acc, curr) => {
                acc[curr._id] = {
                    count: curr.count,
                    users: curr.users
                };
                return acc;
            }, {})
        };

        res.json({
            status: 'success',
            data: formattedStats
        });

    } catch (error) {
        logger.error('Waitlist stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get waitlist stats'
        });
    }
};