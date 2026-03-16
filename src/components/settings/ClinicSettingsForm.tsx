'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Loader2,
  Save,
} from 'lucide-react'
import { WILAYAS } from '@/lib/utils/constants'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/format'

const clinicSchema = z.object({
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  wilaya: z.string().optional(),
  clinicPhone: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
})

type ClinicFormData = z.infer<typeof clinicSchema>

interface ClinicSettingsFormProps {
  doctor: {
    id: string
    clinicName?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    wilaya?: string | null
    clinicPhone?: string | null
    consultationFee?: number | null
  }
  onUpdate?: () => void
}

export function ClinicSettingsForm({ doctor, onUpdate }: ClinicSettingsFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName: doctor.clinicName || '',
      address: doctor.address || '',
      city: doctor.city || '',
      postalCode: doctor.postalCode || '',
      wilaya: doctor.wilaya || '',
      clinicPhone: doctor.clinicPhone || '',
      consultationFee: doctor.consultationFee ? doctor.consultationFee / 100 : 0, // Convert from centimes to DA
    },
  })

  const consultationFee = watch('consultationFee')

  const onSubmit = async (data: ClinicFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: {
            clinicName: data.clinicName,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            wilaya: data.wilaya,
            clinicPhone: data.clinicPhone,
            consultationFee: data.consultationFee ? data.consultationFee * 100 : undefined, // Convert to centimes
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Informations du cabinet mises à jour')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#1B4F72]" />
            Informations du cabinet
          </CardTitle>
          <CardDescription>
            Gérez les informations de votre cabinet médical
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Nom du cabinet</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="clinicName"
                className="pl-9"
                {...register('clinicName')}
                placeholder="Cabinet médical Dr. Benali"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                className="pl-9"
                {...register('address')}
                placeholder="123, Rue Didouche Mourad"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Alger"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="16000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wilaya">Wilaya</Label>
              <Select
                value={doctor.wilaya || ''}
                onValueChange={(value) => setValue('wilaya', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((wilaya) => (
                    <SelectItem key={wilaya.code} value={wilaya.name}>
                      {wilaya.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#148F77]" />
            Contact & Tarifs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicPhone">Téléphone du cabinet</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinicPhone"
                  className="pl-9"
                  {...register('clinicPhone')}
                  placeholder="021 12 34 56"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFee">Tarif de consultation</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="consultationFee"
                  type="number"
                  className="pl-9"
                  {...register('consultationFee', { valueAsNumber: true })}
                  placeholder="2000"
                  min="0"
                  step="100"
                />
                <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                  DA
                </span>
              </div>
              {consultationFee && (
                <p className="text-sm text-muted-foreground">
                  Aperçu: {formatCurrency((consultationFee || 0) * 100)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
