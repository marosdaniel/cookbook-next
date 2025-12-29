import { describe, expect, it } from 'vitest';
import * as components from './emailComponents';

describe('emailComponents', () => {
  describe('emailLayout', () => {
    it('should wrap content in HTML layout', () => {
      const content = '<div>Test content</div>';
      const result = components.emailLayout(content);
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain(content);
      expect(result).toContain('max-width: 600px');
    });
  });

  describe('emailHeader', () => {
    it('should render header with title', () => {
      const title = 'Test Header';
      const result = components.emailHeader(title);
      expect(result).toContain(title);
      expect(result).toContain('<h1');
      expect(result).toContain('background-color:');
    });
  });

  describe('emailFooter', () => {
    it('should render footer with message and disclaimer', () => {
      const message = 'Test Footer Message';
      const disclaimer = 'Test Disclaimer';
      const result = components.emailFooter(message, disclaimer);
      expect(result).toContain(message);
      expect(result).toContain(disclaimer);
    });

    it('should render footer without disclaimer if not provided', () => {
      const message = 'Test Footer Message';
      const result = components.emailFooter(message);
      expect(result).toContain(message);
      expect(result).not.toContain('<p style="margin: 0; color: #666;');
    });
  });

  describe('emailButton', () => {
    it('should render a CTA button with text and href', () => {
      const text = 'Click Me';
      const href = 'https://example.com';
      const result = components.emailButton(text, href);
      expect(result).toContain(text);
      expect(result).toContain(`href="${href}"`);
      expect(result).toContain('background-color:');
    });
  });

  describe('emailParagraph', () => {
    it('should render a paragraph with text', () => {
      const text = 'This is a test paragraph.';
      const result = components.emailParagraph(text);
      expect(result).toContain(text);
      expect(result).toContain('margin: 0 0 20px;');
    });

    it('should support custom bottom margin', () => {
      const text = 'Test';
      const result = components.emailParagraph(text, '40px');
      expect(result).toContain('margin: 0 0 40px;');
    });
  });

  describe('emailWarningBox', () => {
    it('should render a warning box with content and default icon', () => {
      const content = 'Warning message';
      const result = components.emailWarningBox(content);
      expect(result).toContain(content);
      expect(result).toContain('⚠️');
      expect(result).toContain('<strong>Important:</strong>');
    });

    it('should support custom icon', () => {
      const content = 'Info message';
      const result = components.emailWarningBox(content, 'ℹ️');
      expect(result).toContain(content);
      expect(result).toContain('ℹ️');
    });
  });

  describe('emailList', () => {
    it('should render a list of items', () => {
      const items = ['Item 1', 'Item 2'];
      const result = components.emailList(items);
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('<ul');
    });
  });

  describe('emailLink', () => {
    it('should render a link as text with label if provided', () => {
      const url = 'https://example.com';
      const label = 'My Website';
      const result = components.emailLink(url, label);
      expect(result).toContain(label);
      expect(result).not.toContain('>https://example.com<');
    });

    it('should use URL as label if no label provided', () => {
      const url = 'https://example.com';
      const result = components.emailLink(url);
      expect(result).toContain(url);
    });
  });

  describe('emailDivider', () => {
    it('should render an <hr> tag', () => {
      const result = components.emailDivider();
      expect(result).toContain('<hr');
    });
  });

  describe('emailSmallText', () => {
    it('should render small text with provided content', () => {
      const text = 'Small disclaimer';
      const result = components.emailSmallText(text);
      expect(result).toContain(text);
      expect(result).toContain('font-size: 14px');
    });
  });
});
