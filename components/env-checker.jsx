'use client'

import { useEffect, useState } from 'react'

export default function EnvChecker({ children }) {
  const [isEnvReady, setIsEnvReady] = useState(true)
  const [missingVars, setMissingVars] = useState([])

  useEffect(() => {
    // Check for required environment variables on client side
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
    ]

    const missing = requiredVars.filter(varName => !process.env[varName])
    
    if (missing.length > 0) {
      setMissingVars(missing)
      setIsEnvReady(false)
    }
  }, [])

  if (!isEnvReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-lg font-medium text-gray-900">Environment Setup Required</h1>
            <p className="mt-2 text-sm text-gray-500">
              The following environment variables are missing:
            </p>
            <ul className="mt-2 text-sm text-red-600 text-left">
              {missingVars.map(envVar => (
                <li key={envVar}>• {envVar}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Please configure these in your Vercel dashboard under Settings → Environment Variables
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}
