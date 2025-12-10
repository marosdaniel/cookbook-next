/**
 * Brand colors for email templates
 */
export const EMAIL_COLORS = {
  primary: 'rgb(230, 73, 128)',
  white: '#ffffff',
  black: '#333333',
  gray: {
    light: '#f9f9f9',
    medium: '#666666',
    dark: '#999999',
  },
  background: '#f5f5f5',
  warning: {
    background: '#fff3cd',
    border: '#ffc107',
    text: '#856404',
  },
} as const;

/**
 * Font family stack for email templates
 */
export const EMAIL_FONTS = {
  primary:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

/**
 * Common spacing values
 */
export const EMAIL_SPACING = {
  xs: '10px',
  sm: '20px',
  md: '30px',
  lg: '40px',
} as const;

/**
 * Border radius values
 */
export const EMAIL_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
} as const;
