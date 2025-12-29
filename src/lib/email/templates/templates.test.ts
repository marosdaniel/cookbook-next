import { describe, expect, it } from 'vitest';
import { resetPasswordEmailTemplate } from './resetPasswordEmailTemplate';
import { welcomeEmailTemplate } from './welcomeEmailTemplate';

describe('email templates', () => {
  describe('resetPasswordEmailTemplate', () => {
    it('should generate password reset html and text', () => {
      const resetUrl = 'https://cookbook.com/reset/token123';
      const { html, text } = resetPasswordEmailTemplate(resetUrl);

      // HTML checks
      expect(html).toContain('Password Reset Request');
      expect(html).toContain(resetUrl);
      expect(html).toContain('Reset Password');
      expect(html).toContain('expire in 1 hour');

      // Text checks
      expect(text).toContain('Password Reset Request');
      expect(text).toContain(resetUrl);
      expect(text).toContain('expire in 1 hour');
    });
  });

  describe('welcomeEmailTemplate', () => {
    it('should generate welcome html and text with username', () => {
      const userName = 'Chef John';
      const { html, text } = welcomeEmailTemplate(userName);

      // HTML checks
      expect(html).toContain('Welcome to Cookbook!');
      expect(html).toContain(userName);
      expect(html).toContain('Browse and save your favorite recipes');
      expect(html).toContain('Explore Recipes');

      // Text checks
      expect(text).toContain('Welcome to Cookbook!');
      expect(text).toContain(userName);
      expect(text).toContain('Organize your personal cookbook');
    });
  });
});
