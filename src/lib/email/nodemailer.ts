import nodemailer from 'nodemailer';
import { resetPasswordEmailTemplate } from './templates/resetPasswordEmailTemplate';
import { welcomeEmailTemplate } from './templates/welcomeEmailTemplate';

// Check if email is configured
const isEmailConfigured =
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASSWORD;

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  : null;

/**
 * Send password reset email to user
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;
  const { html, text } = resetPasswordEmailTemplate(resetUrl);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Password Reset Request',
    html,
    text,
  };

  try {
    if (!transporter) {
      // Development mode: log the reset URL instead of sending email
      console.log('=================================');
      console.log('📧 EMAIL NOT CONFIGURED - DEVELOPMENT MODE');
      console.log('Password reset link:');
      console.log(resetUrl);
      console.log('=================================');
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email to newly registered user
 */
export const sendWelcomeEmail = async (email: string, userName: string) => {
  const { html, text } = welcomeEmailTemplate(userName);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Welcome to Cookbook!',
    html,
    text,
  };

  try {
    if (!transporter) {
      // Development mode: log instead of sending email
      console.log('=================================');
      console.log('📧 EMAIL NOT CONFIGURED - DEVELOPMENT MODE');
      console.log(`Welcome email would be sent to: ${email}`);
      console.log(`User name: ${userName}`);
      console.log('=================================');
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - we don't want to fail registration if email fails
    console.warn('Registration succeeded but welcome email failed to send');
  }
};

/**
 * Generate a random reset token
 */
export const generateResetToken = (): string => {
  return crypto.randomUUID();
};
