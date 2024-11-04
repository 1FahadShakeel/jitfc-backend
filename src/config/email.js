const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

if (process.env.NODE_ENV === 'test') {
    // Mock transporter for testing
    transporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
    };
} else {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
}

const sendEmail = async (options) => {
    try {
        const info = await transporter.sendMail(options);
        logger.info('Email sent:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Email error:', error);
        throw error;
    }
};

module.exports = { sendEmail };