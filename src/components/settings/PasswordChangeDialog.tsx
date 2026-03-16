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
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface PasswordChangeDialogProps {
  children: React.ReactNode
}

export function PasswordChangeDialog({ children }: PasswordChangeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const calculateStrength = (password: string): { score: number; label: string } => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (score <= 2) return { score, label: 'Faible' }
    if (score <= 4) return { score, label: 'Moyen' }
    if (score <= 5) return { score, label: 'Fort' }
    return { score, label: 'Très fort' }
  }

  const strength = calculateStrength(newPassword)
  const strengthPercent = (strength.score / 6) * 100

  const getStrengthColor = () => {
    if (strength.score <= 2) return 'bg-red-500'
    if (strength.score <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ''
  const isValid = currentPassword.length >= 1 && newPassword.length >= 8 && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe')
      }

      toast.success('Mot de passe modifié avec succès')
      setOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Changer le mot de passe
          </DialogTitle>
          <DialogDescription>
            Entrez votre mot de passe actuel et le nouveau mot de passe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="space-y-1">
                <Progress value={strengthPercent} className="h-2" />
                <p className={`text-xs ${getStrengthColor().replace('bg-', 'text-')}`}>
                  Force: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-1 text-xs">
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Les mots de passe correspondent</span>
                  </>
                ) : (
                  <span className="text-red-500">Les mots de passe ne correspondent pas</span>
                )}
              </div>
            )}
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
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Changer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
