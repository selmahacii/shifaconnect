'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DangerZoneDialogProps {
  children: React.ReactNode
}

export function DangerZoneDialog({ children }: DangerZoneDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const canDelete = confirmText === 'SUPPRIMER'

  const handleDelete = async () => {
    if (!canDelete) return

    setIsLoading(true)
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Compte supprimé avec succès')
      setOpen(false)
      // In a real app, redirect to login page
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le compte
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm font-medium text-destructive mb-2">
              Attention! Cette action supprimera:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Tous les dossiers patients</li>
              <li>Toutes les consultations</li>
              <li>Toutes les ordonnances</li>
              <li>Tous les rendez-vous</li>
              <li>Toutes les données de facturation</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Tapez <span className="font-bold text-destructive">SUPPRIMER</span> pour confirmer
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
