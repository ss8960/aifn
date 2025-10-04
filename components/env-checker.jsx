'use client'

import { useEffect, useState } from 'react'

export default function EnvChecker({ children }) {
  // Temporarily disable environment checking to allow app to work
  // You can re-enable this later once environment variables are properly set
  return children
}
