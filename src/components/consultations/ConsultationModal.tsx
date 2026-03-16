'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { 
  Check, 
  Stethoscope, 
  Plus,
  Loader2,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Info,
  Calendar,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConsultationSchema, ConsultationSchemaType } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'

interface ConsultationModalProps {
  patientId: string
  patientName: string
  appointmentId?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConsultationModal({ 
  patientId, 
  patientName, 
  appointmentId,
  trigger,
  open: externalOpen,
  onOpenChange: setExternalOpen 
}: ConsultationModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = setExternalOpen || setInternalOpen

  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ConsultationSchemaType>({
    resolver: zodResolver(ConsultationSchema) as any,
    defaultValues: {
      patientId,
      motif: '',
      symptoms: '',
      systolicBP: undefined,
      diastolicBP: undefined,
      heartRate: undefined,
      temperature: undefined,
      weight: undefined,
      height: undefined,
      oxygenSaturation: undefined,
      diagnosis: '',
      icdCode: '',
      clinicalNotes: '',
      followUpDate: '',
      followUpNotes: '',
      createPrescription: false,
      scheduleFollowUp: false,
      uploadLabResult: false,
    },
  })

  // Calculate BMI
  const weight = form.watch('weight')
  const height = form.watch('height')
  const bmi = React.useMemo(() => {
    if (weight && height && height > 0) {
      const heightInMeters = height / 100
      return (weight / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return null
  }, [weight, height])

  async function onSubmit(data: ConsultationSchemaType) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!doctor) throw new Error('Profil docteur non trouvé')

      const { data: consultation, error } = await (supabase.from('consultations') as any)
        .insert({
          patient_id: patientId,
          doctor_id: (doctor as any).id,
          chief_complaint: data.motif,
          symptoms: data.symptoms || null,
          diagnosis: data.diagnosis,
          diagnosis_code: data.icdCode || null,
          clinical_notes: data.clinicalNotes || null,
          blood_pressure_systolic: data.systolicBP || null,
          blood_pressure_diastolic: data.diastolicBP || null,
          heart_rate: data.heartRate || null,
          temperature: data.temperature || null,
          weight: data.weight || null,
          height: data.height || null,
          oxygen_saturation: data.oxygenSaturation || null,
          followup_date: data.followUpDate || null,
          followup_notes: data.followUpNotes || null,
        })
        .select()
        .single()

      if (error) throw error

      // If started from an appointment, mark it as completed
      if (appointmentId) {
        await (supabase.from('appointments') as any)
          .update({ status: 'COMPLETED' })
          .eq('id', appointmentId)
      }

      toast.success('Consultation enregistrée avec succès')
      setOpen(false)
      form.reset()

      if (data.createPrescription) {
        router.push(`/dashboard/prescriptions/new?patientId=${patientId}&consultationId=${consultation.id}`)
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#1B4F72] hover:bg-[#153e5a]">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Consultation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-[#1B4F72]" />
            Nouvelle Consultation - {patientName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            {/* SECTION 1: MOTIF */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <ClipboardList className="h-5 w-5 text-[#1B4F72]" />
                1. Motif & Symptômes
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="motif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de la consultation <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Pourquoi le patient consulte-t-il aujourd'hui ?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptômes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description des symptômes rapportés..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION 2: CONSTANTES */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Activity className="h-5 w-5 text-[#1B4F72]" />
                2. Examen clinique (Constantes)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    Tension (SYS/DIA)
                  </Label>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="systolicBP"
                      render={({ field }) => (
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="SYS" 
                            {...field} 
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          />
                        </FormControl>
                      )}
                    />
                    <span className="text-slate-400">/</span>
                    <FormField
                      control={form.control}
                      name="diastolicBP"
                      render={({ field }) => (
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="DIA" 
                            {...field} 
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-500" />
                        Fréq. Cardiaque
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="bpm" 
                            {...field} 
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        Température
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="°C" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oxygenSaturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-green-500" />
                        Saturation O2
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="%" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Weight className="h-3 w-3 text-slate-500" />
                        Poids (kg)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="kg" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-slate-500" />
                        Taille (cm)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="cm" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col justify-end">
                  <Label className="mb-2 text-slate-500">IMC (BMI)</Label>
                  <div className={cn(
                    "h-10 flex items-center px-3 rounded-md border bg-slate-50 font-bold",
                    bmi && parseFloat(bmi) > 25 ? "text-orange-600" : "text-slate-700",
                    bmi && parseFloat(bmi) > 30 ? "text-red-600" : ""
                  )}>
                    {bmi || '--.-'}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: DIAGNOSTIC */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Stethoscope className="h-5 w-5 text-[#1B4F72]" />
                3. Diagnostic & Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostic <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Conclusion de la consultation..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="icdCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Code CIM-10
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-slate-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">La Classification Internationale des Maladies (CIM-10) est un système de codage pour les diagnostics médicaux.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: E11.9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinicalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes cliniques</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SUIVI */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Calendar className="h-5 w-5 text-[#1B4F72]" />
                4. Suivi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de suivi prévue</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followUpNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes de suivi</FormLabel>
                      <FormControl>
                        <Input placeholder="Consignes pour le prochain RDV..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION 5: ACTIONS RAPIDES */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Actions rapides après enregistrement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="createPrescription"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Créer une ordonnance</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduleFollowUp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Planifier un RDV</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uploadLabResult"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Uploader un résultat</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#1B4F72] hover:bg-[#153e5a] px-8" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer la consultation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
