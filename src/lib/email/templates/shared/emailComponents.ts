import {
  EMAIL_COLORS,
  EMAIL_FONTS,
  EMAIL_RADIUS,
  EMAIL_SPACING,
} from './emailStyles';

/**
 * Email layout wrapper with responsive container
 */
export const emailLayout = (content: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: ${EMAIL_FONTS.primary}; background-color: ${EMAIL_COLORS.background};">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: ${EMAIL_SPACING.lg} ${EMAIL_SPACING.sm};">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${EMAIL_COLORS.white}; border-radius: ${EMAIL_RADIUS.lg}; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${content}
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

/**
 * Email header component
 */
export const emailHeader = (title: string) => `
  <tr>
    <td style="padding: ${EMAIL_SPACING.lg} ${EMAIL_SPACING.lg} ${EMAIL_SPACING.md}; text-align: center; background-color: ${EMAIL_COLORS.primary}; border-radius: ${EMAIL_RADIUS.lg} ${EMAIL_RADIUS.lg} 0 0;">
      <h1 style="margin: 0; color: ${EMAIL_COLORS.white}; font-size: 28px; font-weight: 600;">
        ${title}
      </h1>
    </td>
  </tr>
`;

/**
 * Email content wrapper
 */
export const emailContent = (content: string) => `
  <tr>
    <td style="padding: ${EMAIL_SPACING.lg};">
      ${content}
    </td>
  </tr>
`;

/**
 * Email footer component
 */
export const emailFooter = (message: string, disclaimer?: string) => `
  <tr>
    <td style="padding: ${EMAIL_SPACING.md} ${EMAIL_SPACING.lg}; background-color: ${EMAIL_COLORS.gray.light}; border-radius: 0 0 ${EMAIL_RADIUS.lg} ${EMAIL_RADIUS.lg}; text-align: center;">
      <p style="margin: 0 0 ${EMAIL_SPACING.xs}; color: ${EMAIL_COLORS.gray.medium}; font-size: 14px; line-height: 1.5;">
        ${message}
      </p>
      ${
        disclaimer
          ? `<p style="margin: 0; color: ${EMAIL_COLORS.gray.dark}; font-size: 12px; line-height: 1.5;">
        ${disclaimer}
      </p>`
          : ''
      }
    </td>
  </tr>
`;

/**
 * Primary CTA button component
 */
export const emailButton = (text: string, href: string) => `
  <table role="presentation" style="margin: 0 auto;">
    <tr>
      <td style="border-radius: ${EMAIL_RADIUS.md}; background-color: ${EMAIL_COLORS.primary};">
        <a href="${href}" 
           style="display: inline-block; padding: 14px 32px; color: ${EMAIL_COLORS.white}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: ${EMAIL_RADIUS.md};">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

/**
 * Paragraph component
 */
export const emailParagraph = (text: string, marginBottom = '20px') => `
  <p style="margin: 0 0 ${marginBottom}; color: ${EMAIL_COLORS.black}; font-size: 16px; line-height: 1.6;">
    ${text}
  </p>
`;

/**
 * Warning/info box component
 */
export const emailWarningBox = (content: string, icon = '⚠️') => `
  <div style="background: ${EMAIL_COLORS.warning.background}; border-left: 4px solid ${EMAIL_COLORS.warning.border}; padding: 15px; margin: ${EMAIL_SPACING.sm} 0; border-radius: ${EMAIL_RADIUS.sm};">
    <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.warning.text};">
      ${icon} <strong>Important:</strong> ${content}
    </p>
  </div>
`;

/**
 * Link display component (for fallback URLs)
 */
export const emailLink = (url: string, label?: string) => `
  <p style="font-size: 14px; color: ${EMAIL_COLORS.primary}; word-break: break-all;">
    ${label || url}
  </p>
`;

/**
 * Divider/separator line
 */
export const emailDivider = () => `
  <hr style="border: none; border-top: 1px solid #ddd; margin: ${EMAIL_SPACING.md} 0;">
`;

/**
 * Small text component (for disclaimers, etc.)
 */
export const emailSmallText = (
  text: string,
  color = EMAIL_COLORS.gray.medium,
) => `
  <p style="font-size: 14px; color: ${color};">
    ${text}
  </p>
`;

/**
 * List component
 */
export const emailList = (items: string[]) => `
  <ul style="margin: 0 0 ${EMAIL_SPACING.md}; padding-left: ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.black}; font-size: 16px; line-height: 1.8;">
    ${items.map((item) => `<li>${item}</li>`).join('')}
  </ul>
`;
