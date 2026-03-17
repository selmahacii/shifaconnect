
import * as React from 'react'
import Link from 'next/link'
import { 
  Search, 
  Users, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Activity, 
  BarChart3, 
  UserPlus,
  Stethoscope,
  TrendingUp,
  Filter
} from 'lucide-react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

async function getTodayConsultations() {
  const supabase = await createClient()
  const today = new Date()
  const start = startOfDay(today).toISOString()
  const end = endOfDay(today).toISOString()

  const { data: consultations, error } = await (supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(*)
    `)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false }) as any)

  if (error) {
    console.error('Error fetching today consultations:', error)
    return []
  }

  return consultations || []
}

export default async function ConsultationsPage() {
  const consultations = await getTodayConsultations()
  const today = new Date()

  // Calculate Stats
  const total = consultations.length
  const maleCount = consultations.filter((c: any) => c.patient.gender === 'M').length
  const femaleCount = consultations.filter((c: any) => c.patient.gender === 'F').length
  
  const bmiSum = consultations.reduce((acc: number, curr: any) => {
    if (curr.weight && curr.height) {
      return acc + (curr.weight / ((curr.height / 100) ** 2))
    }
    return acc
  }, 0)
  const bmiCount = consultations.filter((c: any) => c.weight && c.height).length
  const avgBmi = bmiCount > 0 ? (bmiSum / bmiCount).toFixed(1) : '--'

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Consultations du jour</h1>
          <p className="text-slate-500">
            {format(today, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <Button asChild className="bg-[#1B4F72] hover:bg-[#153e5a]">
          <Link href="/dashboard/patients">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Aujourd'hui" 
          value={total} 
          icon={<Users className="h-6 w-6 text-blue-600" />}
          description="Patients consultés"
          color="blue"
        />
        <StatsCard 
          title="Répartition Genre" 
          value={`${maleCount}M / ${femaleCount}F`} 
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          description="Ratio Hommes / Femmes"
          color="purple"
        />
        <StatsCard 
          title="IMC Moyen" 
          value={avgBmi} 
          icon={<Activity className="h-6 w-6 text-orange-600" />}
          description="Moyenne des patients"
          color="orange"
        />
        <StatsCard 
          title="Productivité" 
          value={total > 0 ? "Bonne" : "--"} 
          icon={<BarChart3 className="h-6 w-6 text-green-600" />}
          description="Basé sur l'historique"
          color="green"
        />
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1B4F72]" />
              File d'attente & Visites
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Rechercher un patient..." 
                  className="pl-9 w-[250px] bg-white"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {consultations.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Heure</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Diagnostic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <TableCell className="font-medium text-slate-600">
                      {format(new Date(c.created_at), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                          {c.patient.last_name} {c.patient.first_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.patient.gender === 'M' ? 'Homme' : 'Femme'} • {calculateAge(c.patient.date_of_birth)} ans
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={c.chief_complaint}>
                        {c.chief_complaint}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
                        {c.diagnosis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-[#1B4F72] hover:text-[#1B4F72] hover:bg-blue-50">
                        <Link href={`/dashboard/consultations/${c.id}`}>
                          Détails
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                <Stethoscope className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-slate-900">Aucune consultation aujourd'hui</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Les consultations enregistrées aujourd'hui apparaîtront ici. Commencez par sélectionner un patient pour une nouvelle examen.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/patients">Voir la liste des patients</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, icon, description, color }: { 
  title: string, 
  value: any, 
  icon: React.ReactNode, 
  description: string,
  color: 'blue' | 'purple' | 'orange' | 'green'
}) {
  const colors = {
    blue: "border-l-blue-500 bg-blue-50/20",
    purple: "border-l-purple-500 bg-purple-50/20",
    orange: "border-l-orange-500 bg-orange-50/20",
    green: "border-l-green-500 bg-green-50/20",
  }

  return (
    <Card className={cn("border-l-4 shadow-sm", colors[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
