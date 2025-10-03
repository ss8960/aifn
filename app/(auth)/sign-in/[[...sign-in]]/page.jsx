import { SignIn } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
      <SignIn />
    </div>
  );
};

export default Page;