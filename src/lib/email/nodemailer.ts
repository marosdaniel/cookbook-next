import nodemailer from 'nodemailer';
import { env } from '@/env';
import { AUTH_ROUTES } from '../../types/routes';
import { resetPasswordEmailTemplate } from './templates/resetPasswordEmailTemplate';
import { welcomeEmailTemplate } from './templates/welcomeEmailTemplate';

// Check if email is configured
const isEmailConfigured =
  env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD;

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT) || 587,
      secure: env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
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
  const resetUrl = `${env.NEXTAUTH_URL}${AUTH_ROUTES.RESET_PASSWORD}/${resetToken}`;
  const { html, text } = resetPasswordEmailTemplate(resetUrl);

  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
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
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
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
