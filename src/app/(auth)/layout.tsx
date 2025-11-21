import type { FC, PropsWithChildren } from 'react';

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main id="auth-main">{children}</main>;
};

export default AuthLayout;
