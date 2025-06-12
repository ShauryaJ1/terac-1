'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 p-4">
        <button
          onClick={handleSignOut}
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Sign Out
        </button>
      </div>
      <div className="pt-16">
        {children}
      </div>
    </div>
  )
} 