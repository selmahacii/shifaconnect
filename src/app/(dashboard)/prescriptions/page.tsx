
import * as React from 'react'
import Link from 'next/link'
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  User
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
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

async function getPrescriptions(filter: 'all' | 'month' = 'all') {
  const supabase = await createClient()
  
  let query = (supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patients(*)
    `) as any)
    .order('created_at', { ascending: false })

  if (filter === 'month') {
    const start = startOfMonth(new Date()).toISOString()
    const end = endOfMonth(new Date()).toISOString()
    query = (query as any).gte('created_at', start).lte('created_at', end)
  }

  const { data: prescriptions, error } = await query

  if (error) {
    console.error('Error fetching prescriptions:', error)
    return []
  }

  return prescriptions || []
}

export default async function PrescriptionsListPage({ 
  searchParams 
}: { 
  searchParams: { filter?: string } 
}) {
  const filter = (searchParams.filter as 'all' | 'month') || 'all'
  const prescriptions = await getPrescriptions(filter)
  const today = new Date()

  // Stats
  const monthCount = prescriptions.filter((p: any) => {
    const d = new Date(p.created_at)
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }).length

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ordonnances</h1>
          <p className="text-slate-500">Gérez et suivez les prescriptions médicales</p>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild variant="outline">
            <Link href={`?filter=${filter === 'all' ? 'month' : 'all'}`}>
              <Filter className="mr-2 h-4 w-4" />
              {filter === 'all' ? 'Voir ce mois' : 'Voir tout'}
            </Link>
          </Button>
          <Button asChild className="bg-[#1B4F72] hover:bg-[#153e5a]">
            <Link href="/dashboard/patients">
              <FileText className="mr-2 h-4 w-4" />
              Nouvelle ordonnance
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total ce mois" 
          value={monthCount} 
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          description="Ordonnances délivrées"
        />
        <StatsCard 
          title="Moyenne Hebdo" 
          value={Math.round(monthCount / 4) || '--'} 
          icon={<Clock className="h-6 w-6 text-green-600" />}
          description="Basé sur ce mois"
        />
        <StatsCard 
          title="Patients Actifs" 
          value={new Set(prescriptions.map((p: any) => p.patient_id)).size} 
          icon={<User className="h-6 w-6 text-purple-600" />}
          description="Patients avec ordonnance"
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#1B4F72]" />
              Historique des prescriptions
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Rechercher patient ou N°..." 
                className="pl-9 w-[300px] bg-white border-slate-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {prescriptions.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>N° Ordonnance</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médicaments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-slate-600">
                      {format(new Date(p.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        #{p.id.slice(0, 8)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                          {p.patient.last_name} {p.patient.first_name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          NIN: {p.patient.nin || '---'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge className="bg-blue-50 text-[#1B4F72] border-blue-100">
                          {Array.isArray(p.medications) ? p.medications.length : 0} méd.
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#1B4F72]">
                          <Link href={`/dashboard/prescriptions/${p.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {p.pdf_url && (
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#1B4F72]">
                            <a href={p.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-slate-900">Aucune ordonnance trouvée</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  La liste des ordonnances est vide. Les nouvelles prescriptions apparaîtront ici après consultation.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, icon, description }: { 
  title: string, 
  value: any, 
  icon: React.ReactNode, 
  description: string
}) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] text-slate-500">{description}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
