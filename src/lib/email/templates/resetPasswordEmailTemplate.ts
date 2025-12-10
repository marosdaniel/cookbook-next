import {
  emailButton,
  emailContent,
  emailDivider,
  emailHeader,
  emailLayout,
  emailLink,
  emailParagraph,
  emailSmallText,
  emailWarningBox,
} from './shared/emailComponents';

/**
 * Password reset email template
 * @param resetUrl - The URL for resetting the password
 * @returns HTML and plain text email content
 */
export const resetPasswordEmailTemplate = (resetUrl: string) => {
  const content = `
    ${emailHeader('Password Reset Request')}
    
    ${emailContent(`
      ${emailParagraph('Hello,')}
      
      ${emailParagraph('You requested to reset your password. Click the button below to set a new password:')}
      
      <div style="text-align: center; margin: 30px 0;">
        ${emailButton('Reset Password', resetUrl)}
      </div>
      
      ${emailSmallText("If the button doesn't work, copy and paste this link into your browser:")}
      ${emailLink(resetUrl)}
      
      ${emailWarningBox('This link will expire in 1 hour for security reasons.')}
      
      ${emailSmallText("If you didn't request a password reset, please ignore this email and your password will remain unchanged.")}
      
      ${emailDivider()}
      
      <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
        This is an automated message, please do not reply to this email.
      </p>
    `)}
  `;

  const html = emailLayout(content);

  const text = `
    Password Reset Request
    
    Hello,
    
    You requested to reset your password. Click the link below to set a new password:
    
    ${resetUrl}
    
    Important: This link will expire in 1 hour for security reasons.
    
    If you didn't request a password reset, please ignore this email and your password will remain unchanged.
  `;

  return { html, text };
};
