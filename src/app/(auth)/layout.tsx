import type { FC, PropsWithChildren } from 'react';

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="auth-layout">
      {/* <header className="auth-header">
        <Link href="/" className="auth-logo">
          <span>🍳</span> Cookbook
        </Link>
      </header> */}

      <main className="auth-main">{children}</main>

      {/* <footer className="auth-footer">
        <p>&copy; 2025 Cookbook. All rights reserved.</p>
      </footer> */}
    </div>
  );
};

export default AuthLayout;
