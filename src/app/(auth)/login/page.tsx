import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import type { LoginPageProps } from './types';

export const metadata: Metadata = {
  title: 'Login | Cookbook',
  description: 'Sign in to your Cookbook account',
};

const LoginPage: FC<LoginPageProps> = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-footer">
            <Link href="/reset-password" className="link-secondary">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link href="/signup" className="link-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
