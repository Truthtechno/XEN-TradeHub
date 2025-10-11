'use client'

import { SessionProvider } from 'next-auth/react'
import { OptimizedThemeProvider } from '@/lib/optimized-theme-context'
import { RegistrationProvider } from '@/lib/registration-context'
import { SettingsProvider } from '@/lib/settings-context'
import { NotificationsProvider } from '@/lib/notifications-context'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here')

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <OptimizedThemeProvider>
          <NotificationsProvider>
            <RegistrationProvider>
              <Elements stripe={stripePromise}>
                {children}
              </Elements>
            </RegistrationProvider>
          </NotificationsProvider>
        </OptimizedThemeProvider>
      </SettingsProvider>
    </SessionProvider>
  )
}
