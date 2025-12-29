import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock templates to avoid testing HTML content again
vi.mock('./templates/resetPasswordEmailTemplate', () => ({
  resetPasswordEmailTemplate: vi.fn(() => ({
    html: '<p>Reset</p>',
    text: 'Reset text',
  })),
}));

vi.mock('./templates/welcomeEmailTemplate', () => ({
  welcomeEmailTemplate: vi.fn(() => ({
    html: '<p>Welcome</p>',
    text: 'Welcome text',
  })),
}));

// Mock nodemailer
const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
const mockCreateTransport = vi.fn(() => ({
  sendMail: mockSendMail,
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport,
  },
}));

describe('nodemailer.ts', () => {
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      EMAIL_HOST: 'smtp.test.com',
      EMAIL_USER: 'user@test.com',
      EMAIL_PASSWORD: 'password',
      EMAIL_FROM: 'noreply@cookbook.com',
      EMAIL_FROM_NAME: 'Cookbook',
      NEXTAUTH_URL: 'http://localhost:3000',
    };

    // reset modules to re-initialize transporter with mock env
    vi.resetModules();
  });

  describe('sendPasswordResetEmail', () => {
    it('should log reset link in development mode (no transporter)', async () => {
      // Setup env with no email config
      process.env.EMAIL_HOST = '';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { sendPasswordResetEmail } = await import('./nodemailer');
      await sendPasswordResetEmail('test@user.com', 'token123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'http://localhost:3000/reset-password/token123',
        ),
      );
      expect(mockSendMail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should send email when configured', async () => {
      const { sendPasswordResetEmail } = await import('./nodemailer');
      await sendPasswordResetEmail('test@user.com', 'token123');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@user.com',
          subject: 'Password Reset Request',
          html: '<p>Reset</p>',
        }),
      );
    });

    it('should throw error if sendMail fails', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { sendPasswordResetEmail } = await import('./nodemailer');
      await expect(
        sendPasswordResetEmail('test@user.com', 'token123'),
      ).rejects.toThrow('Failed to send password reset email');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should log info in development mode', async () => {
      process.env.EMAIL_HOST = '';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { sendWelcomeEmail } = await import('./nodemailer');
      await sendWelcomeEmail('new@user.com', 'NewUser');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('new@user.com'),
      );
      expect(mockSendMail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should send welcome email when configured', async () => {
      const { sendWelcomeEmail } = await import('./nodemailer');
      await sendWelcomeEmail('new@user.com', 'NewUser');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'new@user.com',
          subject: 'Welcome to Cookbook!',
          html: '<p>Welcome</p>',
        }),
      );
    });

    it('should not throw if sendMail fails for welcome email', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { sendWelcomeEmail } = await import('./nodemailer');
      await expect(
        sendWelcomeEmail('new@user.com', 'NewUser'),
      ).resolves.not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('welcome email failed to send'),
      );

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('generateResetToken', () => {
    it('should return a valid UUID string', async () => {
      const { generateResetToken } = await import('./nodemailer');
      const token = generateResetToken();
      expect(typeof token).toBe('string');
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });
});
