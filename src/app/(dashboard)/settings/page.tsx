
'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Settings as SettingsIcon, 
  Mail, 
  Lock, 
  Crown, 
  ShieldAlert, 
  Building2, 
  Phone, 
  Stamp, 
  PenTool,
  Check,
  X,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { WILAYAS } from '@/lib/utils/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [doctor, setDoctor] = React.useState<any>(null)
  const [user, setUser] = React.useState<any>(null)

  // Fetch doctor and user data
  React.useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single()
        
        if (doctorData) setDoctor(doctorData)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const updates = {
      full_name: formData.get('full_name'),
      full_name_ar: formData.get('full_name_ar'),
      speciality: formData.get('speciality'),
      license_number: formData.get('license_number'),
      clinic_name: formData.get('clinic_name'),
      clinic_address: formData.get('clinic_address'),
      clinic_wilaya: formData.get('clinic_wilaya'),
      phone: formData.get('phone'),
    }

    const { error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('auth_user_id', user.id)

    if (error) {
      toast.error("Erreur lors de la mise à jour")
    } else {
      toast.success("Profil mis à jour avec succès ✓")
      setDoctor({ ...doctor, ...updates })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
      <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#1B4F72] flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Paramètres
        </h1>
        <p className="text-slate-500">Gérez votre compte et les informations de votre cabinet</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border h-12">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#1B4F72] data-[state=active]:text-white h-10">
            <User className="h-4 w-4 mr-2" />
            Mon profil
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-[#1B4F72] data-[state=active]:text-white h-10">
            <Lock className="h-4 w-4 mr-2" />
            Compte
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-[#1B4F72] data-[state=active]:text-white h-10">
            <Crown className="h-4 w-4 mr-2" />
            Abonnement
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Clinic */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#1B4F72] flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations Professionnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom complet (FR)</Label>
                    <Input name="full_name" defaultValue={doctor?.full_name} placeholder="Dr. Ahmed Benali" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block w-full">الاسم الكامل (AR)</Label>
                    <Input name="full_name_ar" defaultValue={doctor?.full_name_ar} placeholder="د. أحمد بن علي" dir="rtl" className="text-right" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Spécialité</Label>
                      <Input name="speciality" defaultValue={doctor?.speciality} placeholder="Médecin généraliste" />
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro d'Ordre</Label>
                      <Input name="license_number" defaultValue={doctor?.license_number} placeholder="ML-12345" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinic Info Card */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#148F77] flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations du Cabinet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom du cabinet</Label>
                    <Input name="clinic_name" defaultValue={doctor?.clinic_name} placeholder="Cabinet médical Ennour" />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input name="clinic_address" defaultValue={doctor?.clinic_address} placeholder="123 Rue Didouche Mourad" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Wilaya</Label>
                      <Select name="clinic_wilaya" defaultValue={doctor?.clinic_wilaya}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {WILAYAS.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input name="phone" defaultValue={doctor?.phone} placeholder="021 XX XX XX" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assets Card */}
              <Card className="lg:col-span-2 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#F39C12] flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Documents de Prescription
                  </CardTitle>
                  <CardDescription>Uploadez votre tampon et signature pour la génération des PDF</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Stamp className="h-4 w-4" />
                      Tampon professionnel
                    </Label>
                    <div className="h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 bg-slate-50">
                      {doctor?.stamp_image_url ? (
                        <img src={doctor.stamp_image_url} alt="Tampon" className="h-full object-contain" />
                      ) : (
                        <Button variant="outline" size="sm" type="button">Choisir une image</Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      Signature numérique
                    </Label>
                    <div className="h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 bg-slate-50">
                      {doctor?.signature_image_url ? (
                        <img src={doctor.signature_image_url} alt="Signature" className="h-full object-contain" />
                      ) : (
                        <Button variant="outline" size="sm" type="button">Choisir une image</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={saving} className="bg-[#1B4F72] px-8 h-12 shadow-lg">
                {saving ? "Enregistrement..." : "Enregistrer toutes les modifications"}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Account Security */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Mettez à jour vos identifiants de connexion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Adresse email</Label>
                  <div className="flex gap-2">
                    <Input defaultValue={user?.email} className="bg-slate-50" />
                    <Button variant="outline">Changer</Button>
                  </div>
                </div>
                <hr />
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Changer le mot de passe</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mot de passe actuel</Label>
                      <Input type="password" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nouveau mot de passe</Label>
                        <Input type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmer le mot de passe</Label>
                        <Input type="password" />
                      </div>
                    </div>
                    <Button className="bg-[#1B4F72]">Mettre à jour le mot de passe</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100 bg-red-50/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription>Actions irréversibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Supprimer mon compte</p>
                    <p className="text-sm text-slate-500">Toutes vos données (patients, consultations, ordonnances) seront définitivement supprimées.</p>
                  </div>
                  <Button variant="destructive">Supprimer</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Subscription */}
        <TabsContent value="subscription" className="mt-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-gradient-to-r from-[#1B4F72] to-[#148F77] text-white border-none">
              <CardContent className="py-8 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Plan Gratuit</h3>
                  <p className="text-white/80">30 jours d&apos;essai — Il vous reste 24 jours</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 px-4 py-1">Actif</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden border rounded-xl bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold text-slate-900">Fonctionnalité</th>
                    <th className="py-4 px-6 text-center font-bold text-slate-900">Gratuit</th>
                    <th className="py-4 px-6 text-center font-bold text-[#148F77]">Pro</th>
                    <th className="py-4 px-6 text-center font-bold text-[#F39C12]">Clinique</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ['Patients illimités', false, true, true],
                    ['Ordonnances illimitées', true, true, true],
                    ['Agenda synchronisé', true, true, true],
                    ['Statistiques mensuelles', false, true, true],
                    ['Rappels SMS', false, '50/mois', '200/mois'],
                    ['Multi-utilisateurs', false, false, 'Jusqu\'à 5'],
                    ['Support prioritaire', false, true, true],
                  ].map(([feature, g, p, c]: any) => (
                    <tr key={feature}>
                      <td className="py-4 px-6 font-medium text-slate-700">{feature}</td>
                      <td className="py-4 px-6 text-center">{typeof g === 'boolean' ? (g ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-slate-300" />) : g}</td>
                      <td className="py-4 px-6 text-center">{typeof p === 'boolean' ? (p ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-slate-300" />) : p}</td>
                      <td className="py-4 px-6 text-center">{typeof c === 'boolean' ? (c ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-slate-300" />) : c}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50">
                    <td className="py-6 px-6 font-bold">Prix mensuel</td>
                    <td className="py-6 px-6 text-center font-black">0 DZD</td>
                    <td className="py-6 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-[#148F77]">3 000 DZD</span>
                        <Button disabled size="sm" className="mt-2 bg-[#148F77]">Passer au Pro</Button>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-[#F39C12]">8 000 DZD</span>
                        <Button disabled size="sm" className="mt-2 bg-[#F39C12]">Passer au Clinique</Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-slate-500 text-sm italic">
               * Paiement en ligne bientôt disponible (Cartes Edahabia & CIB supportées)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
