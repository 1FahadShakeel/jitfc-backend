exports.getWelcomeEmailTemplate = (name) => ({
    subject: 'Welcome to Our Waitlist!',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to Our Platform!</h1>
      <p>Thank you for joining our waitlist. We're excited to have you with us!</p>
      <p>We'll keep you updated on our progress and let you know when you can access the platform.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `
});

exports.getVerificationEmailTemplate = (token) => ({
    subject: 'Verify Your Email',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${process.env.FRONTEND_URL}/verify/${token}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    </div>
  `
});