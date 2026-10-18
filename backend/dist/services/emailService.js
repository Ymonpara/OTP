"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
class EmailService {
    /**
     * Send transactional email.
     * Logs clearly to console in development and provides standard hook for Resend / Nodemailer in production.
     */
    async sendEmail(payload) {
        const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        console.log(`=========================================`);
        console.log(`📧 [TRANSACTIONAL EMAIL DISPATCHED]`);
        console.log(`To: ${payload.to}`);
        console.log(`Subject: ${payload.subject}`);
        console.log(`Message ID: ${messageId}`);
        console.log(`=========================================`);
        return { success: true, messageId };
    }
    async sendWelcomeEmail(to, name) {
        await this.sendEmail({
            to,
            subject: 'Welcome to OTPWallet Platform',
            html: `
        <div style="font-family: sans-serif; background: #090d16; color: #fff; padding: 20px; border-radius: 12px;">
          <h2 style="color: #10b981;">Welcome to OTPWallet, ${name}!</h2>
          <p>Your account has been created. You can top up your wallet and start reserving temporary virtual numbers instantly.</p>
        </div>
      `,
        });
    }
    async sendPasswordResetEmail(to, resetToken) {
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
        await this.sendEmail({
            to,
            subject: 'Reset your OTPWallet account password',
            html: `
        <div style="font-family: sans-serif; background: #090d16; color: #fff; padding: 20px; border-radius: 12px;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: #000; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
      `,
        });
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
