'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleConfirm = async () => {
    setIsPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('ConfirmDialog error:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant}
              onClick={handleConfirm}
              disabled={isPending || isLoading}
              className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : 'bg-[#1B4F72] hover:bg-[#1B4F72]/90'}
            >
              {(isPending || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easier usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'> | null>(null)

  const confirm = React.useCallback((options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(options)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      // Resolve will be handled by the dialog
    })
  }, [])

  const dialogElement = config ? (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      {...config}
    />
  ) : null

  return { confirm, dialogElement, isOpen, setIsOpen }
}
