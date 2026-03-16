'use client'

import * as React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Thermometer, Scale, Ruler, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VitalsData {
  systolicBP?: number | null
  diastolicBP?: number | null
  temperature?: number | null
  pulse?: number | null
  weight?: number | null
  height?: number | null
}

interface VitalsInputProps {
  defaultValues?: VitalsData
  onChange?: (vitals: VitalsData) => void
  readOnly?: boolean
  className?: string
}

// Calculate BMI from weight (kg) and height (cm)
function calculateBMI(weight: number | null | undefined, height: number | null | undefined): number | null {
  if (!weight || !height || height <= 0) return null
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
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

export function VitalsInput({ defaultValues, onChange, readOnly = false, className }: VitalsInputProps) {
  const [vitals, setVitals] = React.useState<VitalsData>(defaultValues || {})
  
  const form = useFormContext()
  const useFormField = (name: keyof VitalsData) => {
    if (!form) return { field: {}, fieldState: {} }
    return {
      field: {
        value: form.watch(`vitals.${name}`) ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value === '' ? null : Number(e.target.value)
          form.setValue(`vitals.${name}`, value, { shouldValidate: true })
          setVitals(prev => {
            const newVitals = { ...prev, [name]: value }
            onChange?.(newVitals)
            return newVitals
          })
        }
      },
      fieldState: form.getFieldState(`vitals.${name}`)
    }
  }

  const handleLocalChange = (name: keyof VitalsData, value: string) => {
    const numValue = value === '' ? null : Number(value)
    setVitals(prev => {
      const newVitals = { ...prev, [name]: numValue }
      onChange?.(newVitals)
      return newVitals
    })
  }

  const bmi = calculateBMI(vitals.weight, vitals.height)
  const bmiCategory = getBMICategory(bmi)

  if (form) {
    return <FormVitalsInput bmi={bmi} bmiCategory={bmiCategory} readOnly={readOnly} className={className} />
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Signes vitaux
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blood Pressure */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              Tension systolique
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="120"
                value={vitals.systolicBP ?? ''}
                onChange={(e) => handleLocalChange('systolicBP', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">mmHg</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              Tension diastolique
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="80"
                value={vitals.diastolicBP ?? ''}
                onChange={(e) => handleLocalChange('diastolicBP', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">mmHg</span>
            </div>
          </div>
        </div>

        {/* Temperature and Pulse */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-orange-500" />
              Température
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                placeholder="37.0"
                value={vitals.temperature ?? ''}
                onChange={(e) => handleLocalChange('temperature', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-pink-500" />
              Pouls
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="72"
                value={vitals.pulse ?? ''}
                onChange={(e) => handleLocalChange('pulse', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">bpm</span>
            </div>
          </div>
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Scale className="h-3 w-3 text-blue-500" />
              Poids
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                placeholder="70"
                value={vitals.weight ?? ''}
                onChange={(e) => handleLocalChange('weight', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">kg</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3 text-purple-500" />
              Taille
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="170"
                value={vitals.height ?? ''}
                onChange={(e) => handleLocalChange('height', e.target.value)}
                disabled={readOnly}
                className="text-right"
              />
              <span className="text-xs text-muted-foreground">cm</span>
            </div>
          </div>
        </div>

        {/* BMI Display */}
        <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
          <div>
            <Label className="text-xs text-muted-foreground">IMC (Indice de masse corporelle)</Label>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-lg font-semibold', bmiCategory.color)}>
                {bmi ?? '-'}
              </span>
              {bmi && <span className="text-sm text-muted-foreground">kg/m²</span>}
            </div>
          </div>
          <div className={cn('text-sm font-medium', bmiCategory.color)}>
            {bmiCategory.label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Form-connected version
function FormVitalsInput({ 
  bmi, 
  bmiCategory, 
  readOnly, 
  className 
}: { 
  bmi: number | null
  bmiCategory: { label: string; color: string }
  readOnly?: boolean
  className?: string
}) {
  const { control, watch, setValue } = useFormContext()
  
  const weight = watch('vitals.weight')
  const height = watch('vitals.height')

  // Calculate BMI when weight or height changes
  React.useEffect(() => {
    const calculatedBMI = calculateBMI(weight, height)
    setValue('vitals.bmi', calculatedBMI)
  }, [weight, height, setValue])

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Signes vitaux
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blood Pressure */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="vitals.systolicBP"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  Tension systolique
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    placeholder="120"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">mmHg</span>
                </div>
              </div>
            )}
          />
          <Controller
            name="vitals.diastolicBP"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  Tension diastolique
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    placeholder="80"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">mmHg</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* Temperature and Pulse */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="vitals.temperature"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  Température
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">°C</span>
                </div>
              </div>
            )}
          />
          <Controller
            name="vitals.pulse"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3 text-pink-500" />
                  Pouls
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    placeholder="72"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">bpm</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="vitals.weight"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Scale className="h-3 w-3 text-blue-500" />
                  Poids
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
            )}
          />
          <Controller
            name="vitals.height"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-purple-500" />
                  Taille
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    {...field}
                    type="number"
                    placeholder="170"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    disabled={readOnly}
                    className="text-right"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* BMI Display */}
        <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
          <div>
            <Label className="text-xs text-muted-foreground">IMC (Indice de masse corporelle)</Label>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-lg font-semibold', bmiCategory.color)}>
                {bmi ?? '-'}
              </span>
              {bmi && <span className="text-sm text-muted-foreground">kg/m²</span>}
            </div>
          </div>
          <div className={cn('text-sm font-medium', bmiCategory.color)}>
            {bmiCategory.label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VitalsInput
