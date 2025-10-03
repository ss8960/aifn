import { SignUp } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
      <SignUp />
    </div>
  );
};

export default Page;