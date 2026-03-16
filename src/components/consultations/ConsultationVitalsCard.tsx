'use client'

import * as React from 'react'
import {
  Heart,
  Thermometer,
  Activity,
  Scale,
  Ruler,
  Droplets,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VitalsData {
  systolicBP?: number | null
  diastolicBP?: number | null
  temperature?: number | null
  pulse?: number | null
  weight?: number | null
  height?: number | null
  bmi?: number | null
  oxygenSaturation?: number | null
}

interface ConsultationVitalsCardProps {
  vitals: VitalsData | null
}

// Get blood pressure status
function getBPStatus(systolic: number | null, diastolic: number | null): { label: string; color: string } {
  if (!systolic || !diastolic) return { label: '-', color: 'text-muted-foreground' }
  
  if (systolic < 90 || diastolic < 60) {
    return { label: 'Hypotension', color: 'text-blue-500' }
  }
  if (systolic >= 180 || diastolic >= 120) {
    return { label: 'Crise hypertensive', color: 'text-red-600' }
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: 'HTA', color: 'text-orange-500' }
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { label: 'Normale haute', color: 'text-yellow-500' }
  }
  return { label: 'Normale', color: 'text-green-500' }
}

// Get temperature status
function getTempStatus(temp: number | null): { label: string; color: string } {
  if (!temp) return { label: '-', color: 'text-muted-foreground' }
  if (temp >= 41) return { label: 'Hyperthermie sévère', color: 'text-red-600' }
  if (temp >= 38.5) return { label: 'Fièvre', color: 'text-orange-500' }
  if (temp >= 37.5) return { label: 'Fièvre légère', color: 'text-yellow-500' }
  if (temp < 35) return { label: 'Hypothermie', color: 'text-blue-500' }
  return { label: 'Normale', color: 'text-green-500' }
}

// Get pulse status
function getPulseStatus(pulse: number | null): { label: string; color: string } {
  if (!pulse) return { label: '-', color: 'text-muted-foreground' }
  if (pulse > 150 || pulse < 40) return { label: 'Anormal', color: 'text-red-500' }
  if (pulse > 100) return { label: 'Tachycardie', color: 'text-orange-500' }
  if (pulse < 50) return { label: 'Bradycardie', color: 'text-blue-500' }
  return { label: 'Normal', color: 'text-green-500' }
}

// Get BMI category
function getBMICategory(bmi: number | null): { label: string; color: string } {
  if (!bmi) return { label: '-', color: 'text-muted-foreground' }
  if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-500' }
  if (bmi < 25) return { label: 'Poids normal', color: 'text-green-500' }
  if (bmi < 30) return { label: 'Surpoids', color: 'text-yellow-500' }
  if (bmi < 35) return { label: 'Obésité modérée', color: 'text-orange-500' }
  return { label: 'Obésité sévère', color: 'text-red-500' }
}

// Get oxygen saturation status
function getO2Status(sat: number | null): { label: string; color: string } {
  if (!sat) return { label: '-', color: 'text-muted-foreground' }
  if (sat < 90) return { label: 'Hypoxémie sévère', color: 'text-red-600' }
  if (sat < 94) return { label: 'Hypoxémie', color: 'text-orange-500' }
  if (sat < 95) return { label: 'Limite', color: 'text-yellow-500' }
  return { label: 'Normal', color: 'text-green-500' }
}

export function ConsultationVitalsCard({ vitals }: ConsultationVitalsCardProps) {
  if (!vitals) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Signes vitaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Aucun signe vital enregistré
          </p>
        </CardContent>
      </Card>
    )
  }

  const hasVitals =
    vitals.systolicBP ||
    vitals.diastolicBP ||
    vitals.temperature ||
    vitals.pulse ||
    vitals.weight ||
    vitals.height ||
    vitals.oxygenSaturation

  if (!hasVitals) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Signes vitaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Aucun signe vital enregistré
          </p>
        </CardContent>
      </Card>
    )
  }

  const bpStatus = getBPStatus(vitals.systolicBP, vitals.diastolicBP)
  const tempStatus = getTempStatus(vitals.temperature)
  const pulseStatus = getPulseStatus(vitals.pulse)
  const bmiCategory = getBMICategory(vitals.bmi)
  const o2Status = getO2Status(vitals.oxygenSaturation)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Signes vitaux
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          {vitals.systolicBP && vitals.diastolicBP && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-3 w-3 text-red-500" />
                Tension artérielle
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.systolicBP}/{vitals.diastolicBP}
                <span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span>
              </p>
              <p className={cn('text-xs mt-1', bpStatus.color)}>{bpStatus.label}</p>
            </div>
          )}

          {/* Temperature */}
          {vitals.temperature && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="h-3 w-3 text-orange-500" />
                Température
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.temperature.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">°C</span>
              </p>
              <p className={cn('text-xs mt-1', tempStatus.color)}>{tempStatus.label}</p>
            </div>
          )}

          {/* Pulse */}
          {vitals.pulse && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-3 w-3 text-pink-500" />
                Pouls
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.pulse}
                <span className="text-sm font-normal text-muted-foreground ml-1">bpm</span>
              </p>
              <p className={cn('text-xs mt-1', pulseStatus.color)}>{pulseStatus.label}</p>
            </div>
          )}

          {/* Weight */}
          {vitals.weight && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Scale className="h-3 w-3 text-blue-500" />
                Poids
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.weight}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
              </p>
            </div>
          )}

          {/* Height */}
          {vitals.height && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-3 w-3 text-purple-500" />
                Taille
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.height}
                <span className="text-sm font-normal text-muted-foreground ml-1">cm</span>
              </p>
            </div>
          )}

          {/* BMI */}
          {vitals.bmi && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-sm text-muted-foreground">IMC</div>
              <p className={cn('text-lg font-semibold mt-1', bmiCategory.color)}>
                {vitals.bmi.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg/m²</span>
              </p>
              <p className={cn('text-xs', bmiCategory.color)}>{bmiCategory.label}</p>
            </div>
          )}

          {/* Oxygen Saturation */}
          {vitals.oxygenSaturation && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="h-3 w-3 text-cyan-500" />
                SpO₂
              </div>
              <p className="text-lg font-semibold mt-1">
                {vitals.oxygenSaturation}
                <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
              </p>
              <p className={cn('text-xs mt-1', o2Status.color)}>{o2Status.label}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
