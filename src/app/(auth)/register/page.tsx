'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Stethoscope, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
  'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf',
  'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
]

const registerSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet est requis (min 3 caractères)'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  clinicName: z.string().min(2, 'Le nom de la clinique est requis'),
  wilaya: z.string().min(1, 'Veuillez sélectionner votre wilaya'),
  licenseNumber: z.string().min(3, 'Le numéro de licence est requis'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      clinicName: '',
      wilaya: '',
      licenseNumber: '',
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Sign up user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // 2. Insert doctor profile
        const { error: profileError } = await (supabase.from('doctors') as any).insert({
          auth_user_id: authData.user.id,
          full_name: data.fullName,
          clinic_name: data.clinicName,
          clinic_wilaya: data.wilaya,
          license_number: data.licenseNumber,
        })

        if (profileError) {
          setError(`Profil non créé: ${profileError.message}`)
          return
        }

        setIsSuccess(true)
        toast.success('Compte créé avec succès !')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Inscription Réussie!</CardTitle>
          <CardDescription className="text-lg">
            Bienvenue docteur. Redirection vers votre tableau de bord...
          </CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Rejoindre Shifa-Connect</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Créez votre cabinet médical numérique en quelques secondes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identity Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input id="fullName" placeholder="Dr. Prénom Nom" {...form.register('fullName')} disabled={isLoading} />
                  {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" type="email" placeholder="docteur@exemple.dz" {...form.register('email')} disabled={isLoading} />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" {...form.register('password')} disabled={isLoading} />
                  {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} disabled={isLoading} />
                  {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Professional Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nom de la clinique / cabinet</Label>
                  <Input id="clinicName" placeholder="Clinique d'Espoir" {...form.register('clinicName')} disabled={isLoading} />
                  {form.formState.errors.clinicName && <p className="text-xs text-destructive">{form.formState.errors.clinicName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wilaya">Wilaya</Label>
                  <Select 
                    onValueChange={(v) => form.setValue('wilaya', v)} 
                    disabled={isLoading}
                    defaultValue={form.getValues('wilaya')}
                  >
                    <SelectTrigger id="wilaya">
                      <SelectValue placeholder="Choisir une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((wilaya) => (
                        <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.wilaya && <p className="text-xs text-destructive">{form.formState.errors.wilaya.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Numéro d'ordre (License)</Label>
                  <Input id="licenseNumber" placeholder="Ex: 12345/ABC" {...form.register('licenseNumber')} disabled={isLoading} />
                  {form.formState.errors.licenseNumber && <p className="text-xs text-destructive">{form.formState.errors.licenseNumber.message}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50/50">
          <div className="text-center text-sm text-slate-500">
            Vous avez déjà un compte?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
