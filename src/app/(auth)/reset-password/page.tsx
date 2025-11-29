import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import { getLocaleFromCookies } from '@/app/layout';
import { getLocaleMessages } from '@/lib/locale';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);

  const auth = messages.auth as Record<string, unknown> | undefined;
  const title =
    typeof auth?.forgotPasswordTitle === 'string'
      ? auth.forgotPasswordTitle
      : 'Forgot Password';
  const description =
    typeof auth?.resetPasswordDescription === 'string'
      ? auth.resetPasswordDescription
      : 'Reset your password';

  return {
    title: `${title} | Cookbook`,
    description,
  };
}

const ResetPasswordPage: FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a link to reset your password
        </p>

        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Send Reset Link
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-switch">
          Remember your password?{' '}
          <Link href="/login" className="link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
