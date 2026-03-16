'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Contact, 
  Activity, 
  X, 
  Plus,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PatientCreateSchema, PatientCreateSchemaType } from '@/lib/validations/schemas'
import { WILAYAS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { id: 1, title: 'Identité', icon: User },
  { id: 2, title: 'Contact', icon: Contact },
  { id: 3, title: 'Antécédents', icon: Activity },
]

const CHRONIC_PRESETS = [
  'Diabète type 1', 'Diabète type 2', 'HTA', 'Asthme', 'Cardiopathie', 
  'Hyperthyroïdie', 'Hypothyroïdie', 'Insuffisance rénale'
]

export function PatientForm() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<PatientCreateSchemaType>({
    resolver: zodResolver(PatientCreateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      dateOfBirth: '',
      gender: 'M',
      nin: '',
      chifaNumber: '',
      phone: '',
      address: '',
      wilaya: '',
      bloodGroup: '',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      notes: '',
    },
  })

  async function onSubmit(data: PatientCreateSchemaType) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: doctor } = (await supabase
        .from('doctors')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()) as any

      if (!doctor) throw new Error('Profil docteur non trouvé')

      const { data: patient, error } = (await (supabase.from('patients') as any)
        .insert({
          doctor_id: (doctor as any).id,
          first_name: data.firstName,
          last_name: data.lastName,
          first_name_ar: data.firstNameAr || null,
          last_name_ar: data.lastNameAr || null,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          national_id: data.nin || null,
          chifa_number: data.chifaNumber || null,
          phone: data.phone || null,
          address: data.address || null,
          wilaya: data.wilaya || null,
          blood_group: data.bloodGroup || null,
          allergies: data.allergies,
          chronic_conditions: data.chronicConditions,
          current_medications: data.currentMedications,
          notes: data.notes || null,
        })
        .select()
        .single()) as any

      if (error) throw error

      toast.success('Patient enregistré avec succès')
      router.push(`/dashboard/patients/${patient.id}`)
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nin', 'chifaNumber']
    } else if (step === 2) {
      fieldsToValidate = ['phone', 'wilaya', 'address']
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setStep(s => Math.min(s + 1, 3))
    }
  }

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1))
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Progress Indicator */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
        <div className="relative flex justify-between">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  step >= s.id 
                    ? "bg-[#1B4F72] border-[#1B4F72] text-white" 
                    : "bg-white border-slate-300 text-slate-400"
                )}
              >
                {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                step >= s.id ? "text-[#1B4F72]" : "text-slate-400"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="BOUMEDIENE" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Houari" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                    <FormField
                      control={form.control}
                      name="lastNameAr"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="w-full block">اللقب</FormLabel>
                          <FormControl>
                            <Input placeholder="بومدين" className="text-right" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstNameAr"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="w-full block">الاسم</FormLabel>
                          <FormControl>
                            <Input placeholder="هواري" className="text-right" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Genre <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <ToggleGroup 
                              type="single" 
                              value={field.value} 
                              onValueChange={(v) => v && field.onChange(v)}
                              className="justify-start gap-2"
                            >
                              <ToggleGroupItem value="M" className="flex-1 max-w-[120px] rounded-lg border px-4 py-2 data-[state=on]:bg-[#1B4F72] data-[state=on]:text-white">
                                Homme
                              </ToggleGroupItem>
                              <ToggleGroupItem value="F" className="flex-1 max-w-[120px] rounded-lg border px-4 py-2 data-[state=on]:bg-pink-600 data-[state=on]:text-white">
                                Femme
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro NIN (15 chiffres)</FormLabel>
                          <FormControl>
                            <Input placeholder="000123456789012" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chifaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro Carte Chifa</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACT */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone (05/06/07...)</FormLabel>
                          <FormControl>
                            <Input placeholder="05XXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wilaya"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wilaya <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Sélectionner une wilaya" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {WILAYAS.map(w => (
                                <SelectItem key={w} value={w}>{w}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse complète</FormLabel>
                        <FormControl>
                          <Input placeholder="Cité 1200 logements, Rue 12..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 3: MEDICAL HISTORY */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groupe Sanguin</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Groupe sanguin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <Label>Allergies</Label>
                    <TagInput 
                      tags={form.watch('allergies')} 
                      setTags={(tags) => form.setValue('allergies', tags)} 
                      placeholder="Ex: Pénicilline, Arachides..."
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Maladies Chroniques</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {CHRONIC_PRESETS.map(preset => (
                        <Badge 
                          key={preset}
                          variant="outline" 
                          className={cn(
                            "cursor-pointer hover:bg-slate-100 py-1.5 px-3",
                            form.watch('chronicConditions').includes(preset) && "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          )}
                          onClick={() => {
                            const current = form.getValues('chronicConditions')
                            if (current.includes(preset)) {
                              form.setValue('chronicConditions', current.filter(c => c !== preset))
                            } else {
                              form.setValue('chronicConditions', [...current, preset])
                            }
                          }}
                        >
                          {preset}
                        </Badge>
                      ))}
                    </div>
                    <TagInput 
                      tags={form.watch('chronicConditions')} 
                      setTags={(tags) => form.setValue('chronicConditions', tags)} 
                      placeholder="Ajouter manuellement..."
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Médicaments en cours</Label>
                    <TagInput 
                      tags={form.watch('currentMedications')} 
                      setTags={(tags) => form.setValue('currentMedications', tags)} 
                      placeholder="Nom du médicament..."
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes médicales générales</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Observations particulières, antécédents familiaux..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || isLoading}
              className="h-12 px-8"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="h-12 px-8 bg-[#1B4F72]">
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="h-12 px-8 bg-[#1B4F72]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer le patient
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

function TagInput({ tags, setTags, placeholder }: { tags: string[], setTags: (tags: string[]) => void, placeholder: string }) {
  const [input, setInput] = React.useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          className="h-11"
        />
        <Button type="button" variant="secondary" onClick={addTag} className="h-11 shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {tags.map(tag => (
          <Badge key={tag} className="bg-slate-100 text-slate-700 hover:bg-slate-200 py-1.5 px-3 flex items-center gap-2 border-none">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
