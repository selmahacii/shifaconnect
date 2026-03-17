'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  User,
  Shield,
  Server,
  Loader2,
} from 'lucide-react'

interface DebugResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: Record<string, unknown>
}

export default function DebugPage(): React.ReactElement {
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<DebugResult[]>([])

  const runDiagnostics = React.useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setResults([])

    const newResults: DebugResult[] = []

    try {
      // Test 1: Database Connection
      newResults.push({ name: 'Connexion Base de données', status: 'loading', message: 'Test en cours...' })
      setResults([...newResults])

      const dbResponse = await fetch('/api/debug/database')
      const dbData = await dbResponse.json()
      
      newResults[0] = {
        name: 'Connexion Base de données',
        status: dbResponse.ok ? 'success' : 'error',
        message: dbData.message || (dbResponse.ok ? 'Connexion réussie' : 'Erreur de connexion'),
        details: dbData.details,
      }
      setResults([...newResults])

      // Test 2: Current User
      newResults.push({ name: 'Utilisateur actuel', status: 'loading', message: 'Récupération...' })
      setResults([...newResults])

      const userResponse = await fetch('/api/debug/user')
      const userData = await userResponse.json()

      newResults[1] = {
        name: 'Utilisateur actuel',
        status: userData.user ? 'success' : 'warning',
        message: userData.user 
          ? `Connecté: ${userData.user.name} (${userData.user.email})`
          : 'Aucun utilisateur connecté',
        details: userData.user,
      }
      setResults([...newResults])

      // Test 3: Doctor Profile
      newResults.push({ name: 'Profil Médecin', status: 'loading', message: 'Récupération...' })
      setResults([...newResults])

      const doctorResponse = await fetch('/api/debug/doctor')
      const doctorData = await doctorResponse.json()

      newResults[2] = {
        name: 'Profil Médecin',
        status: doctorData.doctor ? 'success' : 'warning',
        message: doctorData.doctor
          ? `Dr. ${doctorData.doctor.user?.name || 'N/A'} - ${doctorData.doctor.specialization || 'Spécialité non définie'}`
          : 'Aucun profil médecin trouvé',
        details: doctorData.doctor,
      }
      setResults([...newResults])

      // Test 4: RLS Policies
      newResults.push({ name: 'Test RLS Patients', status: 'loading', message: 'Test en cours...' })
      setResults([...newResults])

      const rlsResponse = await fetch('/api/debug/rls')
      const rlsData = await rlsResponse.json()

      newResults[3] = {
        name: 'Test RLS Patients',
        status: rlsData.canRead ? 'success' : 'error',
        message: rlsData.canRead
          ? `Lecture OK - ${rlsData.patientCount} patients accessibles`
          : 'Erreur: Impossible de lire les patients',
        details: rlsData,
      }
      setResults([...newResults])

      // Test 5: Appointments Access
      newResults.push({ name: 'Test RLS Rendez-vous', status: 'loading', message: 'Test en cours...' })
      setResults([...newResults])

      const aptResponse = await fetch('/api/debug/rls?type=appointments')
      const aptData = await aptResponse.json()

      newResults[4] = {
        name: 'Test RLS Rendez-vous',
        status: aptData.canRead ? 'success' : 'error',
        message: aptData.canRead
          ? `Lecture OK - ${aptData.count || 0} rendez-vous`
          : 'Erreur: Impossible de lire les rendez-vous',
        details: aptData,
      }
      setResults([...newResults])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      newResults.push({
        name: 'Erreur générale',
        status: 'error',
        message: errorMessage,
      })
      setResults([...newResults])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStatusIcon = (status: DebugResult['status']): React.ReactElement => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-[#27AE60]" />
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-[#F39C12]" />
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-[#1B4F72]" />
    }
  }

  const getStatusBadge = (status: DebugResult['status']): React.ReactElement => {
    const variants: Record<string, 'success' | 'destructive' | 'secondary' | 'outline'> = {
      success: 'success',
      error: 'destructive',
      warning: 'secondary',
      loading: 'outline',
    }
    const labels: Record<string, string> = {
      success: 'Succès',
      error: 'Erreur',
      warning: 'Attention',
      loading: 'En cours',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#1B4F72]" />
              Diagnostic Système
            </h1>
            <p className="text-muted-foreground">
              Vérification de la configuration Supabase et RLS
            </p>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Lancer le diagnostic
              </>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[#1B4F72]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-[#1B4F72]" />
                <div>
                  <p className="text-sm text-muted-foreground">Base de données</p>
                  <p className="font-semibold">SQLite / Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#148F77]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-[#148F77]" />
                <div>
                  <p className="text-sm text-muted-foreground">Environnement</p>
                  <p className="font-semibold">{process.env.NODE_ENV || 'development'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#F39C12]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-[#F39C12]" />
                <div>
                  <p className="text-sm text-muted-foreground">Authentification</p>
                  <p className="font-semibold">NextAuth.js</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Résultats du diagnostic</h2>
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <CardTitle className="text-base">{result.name}</CardTitle>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Détails techniques
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#F39C12]" />
              Problèmes courants RLS
            </CardTitle>
            <CardDescription>
              Si les tests RLS échouent, vérifiez les points suivants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Authentification utilisateur</h4>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que l&apos;utilisateur est correctement authentifié et que l&apos;ID utilisateur
                correspond à celui attendu par les politiques RLS.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Liaison Doctor-User</h4>
              <p className="text-sm text-muted-foreground">
                Vérifiez que la table <code className="bg-muted px-1 rounded">doctors</code> a une
                colonne <code className="bg-muted px-1 rounded">user_id</code> ou 
                <code className="bg-muted px-1 rounded">auth_user_id</code> correctement peuplée.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Politiques RLS</h4>
              <p className="text-sm text-muted-foreground">
                Les politiques doivent utiliser <code className="bg-muted px-1 rounded">auth.uid()</code>
                pour filtrer les données par utilisateur.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">4. Client Supabase</h4>
              <p className="text-sm text-muted-foreground">
                Utilisez le client serveur avec la clé service_role pour les opérations admin,
                et le client navigateur avec la session utilisateur pour les requêtes RLS.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SQL Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modèles SQL pour Supabase</CardTitle>
            <CardDescription>
              Exemples de politiques RLS pour les tables principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="text-xs bg-muted p-4 rounded-md">
{`-- Activer RLS sur les tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politique pour doctors (lecture de son propre profil)
CREATE POLICY "Doctors can view own profile"
ON doctors FOR SELECT
USING (user_id = auth.uid());

-- Politique pour patients (accès via doctor_id)
CREATE POLICY "Doctors can manage their patients"
ON patients FOR ALL
USING (doctor_id IN (
  SELECT id FROM doctors WHERE user_id = auth.uid()
));

-- Politique pour consultations
CREATE POLICY "Doctors can manage their consultations"
ON consultations FOR ALL
USING (doctor_id IN (
  SELECT id FROM doctors WHERE user_id = auth.uid()
));

-- Politique pour appointments
CREATE POLICY "Doctors can manage their appointments"
ON appointments FOR ALL
USING (doctor_id IN (
  SELECT id FROM doctors WHERE user_id = auth.uid()
));

-- Vérifier les politiques existantes
SELECT * FROM pg_policies 
WHERE tablename IN ('doctors', 'patients', 'consultations', 'appointments');`}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
