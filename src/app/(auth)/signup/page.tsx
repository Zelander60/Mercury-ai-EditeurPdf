import React from 'react';
import { SignUp } from '@clerk/nextjs';

const SignupPage = () => {
  return (
    <div className="w-full flex justify-center items-center">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default SignupPage;