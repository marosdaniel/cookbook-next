import type { Metadata } from 'next';
import type { FC } from 'react';
import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Cookbook',
  description: 'Create a new Cookbook account',
};

const SignUpPage: FC = () => {
  return <SignUpForm />;
};

export default SignUpPage;
