
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Mince ! Une erreur est survenue</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Nous n&apos;avons pas pu charger cette page. Cela peut être dû à un problème de connexion ou à une erreur temporaire sur nos serveurs.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard">Retour au tableau de bord</a>
        </Button>
      </div>
    </div>
  )
}
