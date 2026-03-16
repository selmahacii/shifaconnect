'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore()

  useEffect(() => {
    // Check if user is authenticated
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  )
}
