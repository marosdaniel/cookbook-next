import type { Metadata } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import type { SignUpPageProps } from './types';

export const metadata: Metadata = {
  title: 'Sign Up | Cookbook',
  description: 'Create a new Cookbook account',
};

const SignUpPage: FC<SignUpPageProps> = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Cookbook and start sharing recipes</p>

        <form className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last name"
                required
              />
            </div>
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link href="/login" className="link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
