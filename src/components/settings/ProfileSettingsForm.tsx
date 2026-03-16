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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FileText,
  MapPin,
  Camera,
  Loader2,
  Save,
  Stamp,
  PenTool,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { WILAYAS } from '@/lib/utils/constants'
import { toast } from 'sonner'

const profileSchema = z.object({
  // User fields
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  
  // Doctor fields
  professionalTitle: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  wilaya: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSettingsFormProps {
  user: {
    id: string
    email: string
    name: string
    phone?: string | null
    avatar?: string | null
  }
  doctor: {
    id: string
    professionalTitle?: string | null
    specialization?: string | null
    licenseNumber?: string | null
    wilaya?: string | null
    stampImage?: string | null
    signatureImage?: string | null
  }
  onUpdate?: () => void
}

const PROFESSIONAL_TITLES = [
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Pr.', label: 'Pr.' },
  { value: 'Dr. Pr.', label: 'Dr. Pr.' },
  { value: 'MC', label: 'Maître de Conférences' },
]

const SPECIALIZATIONS = [
  { value: 'Médecine générale', label: 'Médecine générale' },
  { value: 'Pédiatrie', label: 'Pédiatrie' },
  { value: 'Cardiologie', label: 'Cardiologie' },
  { value: 'Dermatologie', label: 'Dermatologie' },
  { value: 'Gynécologie', label: 'Gynécologie' },
  { value: 'Ophtalmologie', label: 'Ophtalmologie' },
  { value: 'ORL', label: 'ORL' },
  { value: 'Orthopédie', label: 'Orthopédie' },
  { value: 'Neurologie', label: 'Neurologie' },
  { value: 'Psychiatrie', label: 'Psychiatrie' },
  { value: 'Radiologie', label: 'Radiologie' },
  { value: 'Chirurgie', label: 'Chirurgie' },
  { value: 'Autre', label: 'Autre' },
]

export function ProfileSettingsForm({ user, doctor, onUpdate }: ProfileSettingsFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [avatarUploading, setAvatarUploading] = React.useState(false)
  const [stampUploading, setStampUploading] = React.useState(false)
  const [signatureUploading, setSignatureUploading] = React.useState(false)
  const [stampPreview, setStampPreview] = React.useState<string | null>(doctor.stampImage || null)
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(doctor.signatureImage || null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone || '',
      professionalTitle: doctor.professionalTitle || '',
      specialization: doctor.specialization || '',
      licenseNumber: doctor.licenseNumber || '',
      wilaya: doctor.wilaya || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: data.name,
            phone: data.phone,
          },
          doctor: {
            professionalTitle: data.professionalTitle,
            specialization: data.specialization,
            licenseNumber: data.licenseNumber,
            wilaya: data.wilaya,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Profil mis à jour avec succès')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      // For now, just show a preview - in production you'd upload to a storage service
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        // Update avatar via API
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: { avatar: base64 },
          }),
        })
        
        if (response.ok) {
          toast.success('Photo de profil mise à jour')
          onUpdate?.()
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Erreur lors du téléchargement de la photo')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleStampChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('L\'image est trop volumineuse. Maximum 500 Ko.')
      return
    }

    setStampUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor: { stampImage: base64 },
          }),
        })
        
        if (response.ok) {
          setStampPreview(base64)
          toast.success('Tampon mis à jour avec succès')
          onUpdate?.()
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Erreur lors du téléchargement du tampon')
    } finally {
      setStampUploading(false)
    }
  }

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('L\'image est trop volumineuse. Maximum 500 Ko.')
      return
    }

    setSignatureUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor: { signatureImage: base64 },
          }),
        })
        
        if (response.ok) {
          setSignaturePreview(base64)
          toast.success('Signature mise à jour avec succès')
          onUpdate?.()
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Erreur lors du téléchargement de la signature')
    } finally {
      setSignatureUploading(false)
    }
  }

  const removeStamp = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: { stampImage: null },
        }),
      })
      
      if (response.ok) {
        setStampPreview(null)
        toast.success('Tampon supprimé')
        onUpdate?.()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const removeSignature = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: { signatureImage: null },
        }),
      })
      
      if (response.ok) {
        setSignaturePreview(null)
        toast.success('Signature supprimée')
        onUpdate?.()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo de profil</CardTitle>
          <CardDescription>
            Personnalisez votre photo de profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="bg-[#1B4F72] text-white text-xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#148F77] text-white flex items-center justify-center cursor-pointer hover:bg-[#148F77]/90 transition-colors"
              >
                {avatarUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {doctor.specialization && (
                <Badge variant="secondary" className="mt-2 bg-[#1B4F72]/10 text-[#1B4F72]">
                  {doctor.specialization}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-[#1B4F72]" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9"
                  {...register('name')}
                  placeholder="Dr. Ahmed Benali"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  {...register('phone')}
                  placeholder="0555 12 34 56"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                className="pl-9 bg-muted/50"
                value={user.email}
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              L'email ne peut pas être modifié
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#148F77]" />
            Informations professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="professionalTitle">Titre professionnel</Label>
              <Select
                value={doctor.professionalTitle || ''}
                onValueChange={(value) => setValue('professionalTitle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un titre" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_TITLES.map((title) => (
                    <SelectItem key={title.value} value={title.value}>
                      {title.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Spécialité</Label>
              <Select
                value={doctor.specialization || ''}
                onValueChange={(value) => setValue('specialization', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Numéro d'inscription à l'Ordre</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="licenseNumber"
                  className="pl-9"
                  {...register('licenseNumber')}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wilaya">Wilaya</Label>
              <Select
                value={doctor.wilaya || ''}
                onValueChange={(value) => setValue('wilaya', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une wilaya" />
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

      {/* Stamp & Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PenTool className="h-5 w-5 text-[#F39C12]" />
            Tampon et Signature
          </CardTitle>
          <CardDescription>
            Ces images apparaîtront sur vos ordonnances et certificats PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stamp Upload */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Stamp className="h-4 w-4" />
                Tampon du médecin
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {stampPreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={stampPreview} 
                      alt="Tampon" 
                      className="max-h-32 mx-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeStamp}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="stamp-upload"
                    className="cursor-pointer py-8 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {stampUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#1B4F72]" />
                    ) : (
                      <ImageIcon className="h-8 w-8" />
                    )}
                    <span className="text-sm">
                      {stampUploading ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                    </span>
                    <span className="text-xs">PNG, JPG (max 500 Ko)</span>
                  </label>
                )}
                <input
                  id="stamp-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleStampChange}
                  disabled={stampUploading}
                />
              </div>
              {stampPreview && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => document.getElementById('stamp-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Remplacer le tampon
                </Button>
              )}
            </div>

            {/* Signature Upload */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Signature
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {signaturePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={signaturePreview} 
                      alt="Signature" 
                      className="max-h-32 mx-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeSignature}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="signature-upload"
                    className="cursor-pointer py-8 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {signatureUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#1B4F72]" />
                    ) : (
                      <PenTool className="h-8 w-8" />
                    )}
                    <span className="text-sm">
                      {signatureUploading ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                    </span>
                    <span className="text-xs">PNG avec fond transparent recommandé</span>
                  </label>
                )}
                <input
                  id="signature-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureChange}
                  disabled={signatureUploading}
                />
              </div>
              {signaturePreview && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => document.getElementById('signature-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Remplacer la signature
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Conseil: Pour de meilleurs résultats, utilisez une image PNG avec fond transparent pour votre signature.
          </p>
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
