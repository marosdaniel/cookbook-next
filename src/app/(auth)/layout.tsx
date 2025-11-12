import Link from 'next/link';
import type { FC } from 'react';
import './auth.css';
import type { AuthLayoutProps } from './types';

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <Link href="/" className="auth-logo">
          <span>🍳</span> Cookbook
        </Link>
      </header>

      <main className="auth-main">{children}</main>

      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} Cookbook. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
