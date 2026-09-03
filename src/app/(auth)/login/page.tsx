import React from 'react';
import { SignIn } from '@clerk/nextjs';

const LoginPage = () => {
  return (
    <div className="w-full flex justify-center items-center">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default LoginPage;