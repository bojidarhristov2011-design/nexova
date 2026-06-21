'use client'

import { SessionProvider } from 'next-auth/react'
import { MobileGuard } from './MobileGuard'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MobileGuard>{children}</MobileGuard>
    </SessionProvider>
  )
}
