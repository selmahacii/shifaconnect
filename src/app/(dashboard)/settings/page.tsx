'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Settings,
  User,
  Building2,
  Clock,
  Shield,
  Lock,
  ArrowRight,
  CreditCard,
} from 'lucide-react'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'
import { ClinicSettingsForm } from '@/components/settings/ClinicSettingsForm'
import { PreferencesForm } from '@/components/settings/PreferencesForm'
import { PasswordChangeDialog } from '@/components/settings/PasswordChangeDialog'
import { DangerZoneDialog } from '@/components/settings/DangerZoneDialog'
import { SubscriptionTab } from '@/components/settings/SubscriptionTab'
import Link from 'next/link'

interface SettingsData {
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
    address?: string | null
    city?: string | null
    postalCode?: string | null
    clinicPhone?: string | null
    clinicName?: string | null
    consultationFee?: number | null
    workingHours?: string | null
    stampImage?: string | null
    signatureImage?: string | null
  }
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  if (isLoading) {
    return (
      <div className="p-6">
        <SettingsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-destructive">Erreur: {error}</p>
      </div>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#1B4F72]" />
              Paramètres
            </h1>
            <p className="text-muted-foreground">
              Gérez votre profil et les paramètres de votre cabinet
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[#1B4F72]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-[#1B4F72]" />
                <div>
                  <p className="text-sm text-muted-foreground">Profil</p>
                  <p className="font-semibold">{settings.user.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#148F77]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-[#148F77]" />
                <div>
                  <p className="text-sm text-muted-foreground">Cabinet</p>
                  <p className="font-semibold">{settings.doctor.clinicName || 'Non configuré'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#F39C12]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-[#F39C12]" />
                <div>
                  <p className="text-sm text-muted-foreground">Spécialité</p>
                  <p className="font-semibold">{settings.doctor.specialization || 'Non spécifiée'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="clinic" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Cabinet</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileSettingsForm
              user={settings.user}
              doctor={settings.doctor}
              onUpdate={fetchSettings}
            />
          </TabsContent>

          {/* Clinic Tab */}
          <TabsContent value="clinic">
            <ClinicSettingsForm
              doctor={settings.doctor}
              onUpdate={fetchSettings}
            />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <PreferencesForm
              doctor={settings.doctor}
              onUpdate={fetchSettings}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#1B4F72]" />
                  Mot de passe
                </CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe pour sécuriser votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mot de passe</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification: il y a plus de 30 jours
                    </p>
                  </div>
                  <PasswordChangeDialog>
                    <Button variant="outline" className="gap-2">
                      <Lock className="h-4 w-4" />
                      Modifier
                    </Button>
                  </PasswordChangeDialog>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Zone dangereuse
                </CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium text-destructive">Supprimer le compte</p>
                    <p className="text-sm text-muted-foreground">
                      Cette action est irréversible. Toutes vos données seront supprimées.
                    </p>
                  </div>
                  <DangerZoneDialog>
                    <Button variant="destructive" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </DangerZoneDialog>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Exporter les données</p>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez une copie de toutes vos données
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <SubscriptionTab />
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href="/patients">
              <User className="h-4 w-4 mr-2" />
              Gérer les patients
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/agenda">
              <Clock className="h-4 w-4 mr-2" />
              Gérer l&apos;agenda
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/consultations">
              <Building2 className="h-4 w-4 mr-2" />
              Voir les consultations
            </Link>
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
