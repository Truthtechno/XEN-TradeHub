import { Suspense } from 'react'
import HomePage from './page-content'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-white text-lg">Loading XEN TradeHub...</p>
        </div>
      </div>
    }>
      <HomePage />
    </Suspense>
  )
}
