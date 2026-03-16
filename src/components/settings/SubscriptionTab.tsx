'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Crown,
  Sparkles,
  Building2,
  CreditCard,
  Clock,
  Shield,
  Users,
  FileText,
  Calendar,
  BarChart3,
  HeadphonesIcon,
  Zap,
} from 'lucide-react'

interface PlanFeature {
  name: string
  gratuit: boolean | string
  pro: boolean | string
  clinique: boolean | string
}

const PLANS: PlanFeature[] = [
  { name: 'Patients', gratuit: '100', pro: 'Illimité', clinique: 'Illimité' },
  { name: 'Consultations/mois', gratuit: '50', pro: 'Illimité', clinique: 'Illimité' },
  { name: 'Ordonnances', gratuit: true, pro: true, clinique: true },
  { name: 'Certificats médicaux', gratuit: true, pro: true, clinique: true },
  { name: 'Agenda/Rendez-vous', gratuit: true, pro: true, clinique: true },
  { name: 'Export PDF', gratuit: true, pro: true, clinique: true },
  { name: 'Statistiques avancées', gratuit: false, pro: true, clinique: true },
  { name: 'Rappels SMS', gratuit: false, pro: '50/mois', clinique: '200/mois' },
  { name: 'Multi-utilisateurs', gratuit: false, pro: false, clinique: 'Jusqu\'à 5' },
  { name: 'Support prioritaire', gratuit: false, pro: true, clinique: true },
  { name: 'API Access', gratuit: false, pro: false, clinique: true },
  { name: 'Sauvegarde cloud', gratuit: false, pro: true, clinique: true },
]

const CHECK_ICON = <Check className="h-4 w-4 text-[#27AE60]" />
const X_ICON = <X className="h-4 w-4 text-muted-foreground" />

export function SubscriptionTab() {
  const [selectedPlan, setSelectedPlan] = React.useState<'pro' | 'clinique' | null>(null)

  const renderValue = (value: boolean | string) => {
    if (value === true) return CHECK_ICON
    if (value === false) return X_ICON
    return <span className="text-sm font-medium">{value}</span>
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Banner */}
      <Card className="border-[#1B4F72]/20 bg-gradient-to-r from-[#1B4F72]/5 to-[#148F77]/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#1B4F72]/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#1B4F72]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Plan Gratuit</h3>
                  <Badge variant="secondary" className="bg-[#27AE60]/10 text-[#27AE60]">
                    <Clock className="h-3 w-3 mr-1" />
                    30 jours d&apos;essai
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Accédez aux fonctionnalités de base pour gérer votre cabinet
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1B4F72]">0 DZD</p>
              <p className="text-xs text-muted-foreground">/mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pro Plan */}
        <Card className={`relative ${selectedPlan === 'pro' ? 'border-[#148F77] ring-2 ring-[#148F77]/20' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#148F77]" />
                <CardTitle>Pro</CardTitle>
              </div>
              <Badge className="bg-[#148F77]">Populaire</Badge>
            </div>
            <CardDescription>
              Idéal pour les médecins avec une pratique active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">3 000</span>
              <span className="text-muted-foreground">DZD/mois</span>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-[#148F77]" />
                Patients illimités
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-[#148F77]" />
                Consultations illimitées
              </li>
              <li className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-[#148F77]" />
                Statistiques avancées
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#148F77]" />
                50 rappels SMS/mois
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-[#148F77]" />
                Sauvegarde cloud
              </li>
            </ul>

            <Button 
              className="w-full bg-[#148F77] hover:bg-[#148F77]/90"
              disabled
              onClick={() => setSelectedPlan('pro')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Passer au Pro
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Paiement en ligne bientôt disponible
            </p>
          </CardContent>
        </Card>

        {/* Clinique Plan */}
        <Card className={`relative ${selectedPlan === 'clinique' ? 'border-[#F39C12] ring-2 ring-[#F39C12]/20' : ''}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#F39C12]" />
              <CardTitle>Clinique</CardTitle>
            </div>
            <CardDescription>
              Pour les cabinets avec plusieurs médecins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">8 000</span>
              <span className="text-muted-foreground">DZD/mois</span>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-[#F39C12]" />
                Jusqu&apos;à 5 utilisateurs
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-[#F39C12]" />
                Tout dans Pro, plus:
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#F39C12]" />
                200 rappels SMS/mois
              </li>
              <li className="flex items-center gap-2 text-sm">
                <HeadphonesIcon className="h-4 w-4 text-[#F39C12]" />
                Support prioritaire
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-[#F39C12]" />
                API Access
              </li>
            </ul>

            <Button 
              className="w-full bg-[#F39C12] hover:bg-[#F39C12]/90"
              disabled
              onClick={() => setSelectedPlan('clinique')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Passer au Clinique
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Paiement en ligne bientôt disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparaison des fonctionnalités</CardTitle>
          <CardDescription>
            Voyez ce qui est inclus dans chaque plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Fonctionnalité</th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Sparkles className="h-4 w-4 text-[#1B4F72]" />
                      Gratuit
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4 text-[#148F77]" />
                      Pro
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Building2 className="h-4 w-4 text-[#F39C12]" />
                      Clinique
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((feature, index) => (
                  <tr 
                    key={feature.name} 
                    className={`${index < PLANS.length - 1 ? 'border-b' : ''} hover:bg-muted/50 transition-colors`}
                  >
                    <td className="py-3 px-4 text-sm">{feature.name}</td>
                    <td className="text-center py-3 px-4">{renderValue(feature.gratuit)}</td>
                    <td className="text-center py-3 px-4">{renderValue(feature.pro)}</td>
                    <td className="text-center py-3 px-4">{renderValue(feature.clinique)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Notice */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F39C12]/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-[#F39C12]" />
            </div>
            <div>
              <h4 className="font-medium">Paiement en ligne bientôt disponible</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Nous travaillons activement à l&apos;intégration des paiements en ligne (cartes bancaires, CIB, Edahabia). 
                En attendant, vous pouvez nous contacter pour un paiement par virement bancaire ou en espèces.
              </p>
              <Button variant="outline" className="mt-3" size="sm">
                Nous contacter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
