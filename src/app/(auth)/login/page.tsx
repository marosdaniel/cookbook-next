import type { Metadata } from 'next';
import type { FC } from 'react';
import { LoginForm } from './LoginForm';
import type { LoginPageProps } from './types';

export const metadata: Metadata = {
  title: 'Login | Cookbook',
  description: 'Sign in to your Cookbook account',
};

const LoginPage: FC<LoginPageProps> = () => {
  return <LoginForm />;
};

export default LoginPage;
