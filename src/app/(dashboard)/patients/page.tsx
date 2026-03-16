'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Grid, 
  List, 
  Search,
  Calendar,
  Phone,
  MapPin,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getAgeFromBirthDate, formatPhone, formatDate, WILAYAS } from '@/lib/utils';

// Types
interface Patient {
  id: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phone?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  wilaya?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  isActive: boolean;
  createdAt: string;
  lastConsultation?: {
    consultationDate: string;
    chiefComplaint: string;
  } | null;
}

interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter state
interface Filters {
  search: string;
  gender: 'ALL' | 'MALE' | 'FEMALE';
  wilaya: string;
  sortBy: 'name' | 'date' | 'lastVisit';
  sortOrder: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 20;

export default function PatientsPage() {
  const [viewMode, setViewMode] = React.useState<'card' | 'table'>('table');
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Pagination
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  
  // Filters
  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    gender: 'ALL',
    wilaya: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Debounced search
  const [searchInput, setSearchInput] = React.useState('');
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch patients
  const fetchPatients = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.gender !== 'ALL') params.append('gender', filters.gender);
      if (filters.wilaya) params.append('wilaya', filters.wilaya);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/patients?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      
      const data: PatientListResponse = await response.json();
      setPatients(data.patients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPage(1);
    }, 300);
  };

  // Get last visit display
  const getLastVisitDisplay = (patient: Patient) => {
    if (!patient.lastConsultation) return '-';
    return formatDate(patient.lastConsultation.consultationDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: '#1B4F72' }} />
            Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les dossiers de vos patients
          </p>
        </div>
        <Button 
          asChild 
          className="text-white"
          style={{ backgroundColor: '#1B4F72' }}
        >
          <Link href="/dashboard/patients/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau patient
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, NIN, N° Chifa, téléphone..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Gender Filter */}
              <Select
                value={filters.gender}
                onValueChange={(value) => {
                  setFilters(prev => ({ ...prev, gender: value as Filters['gender'] }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-10">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="MALE">Masculin</SelectItem>
                  <SelectItem value="FEMALE">Féminin</SelectItem>
                </SelectContent>
              </Select>

              {/* Wilaya Filter */}
              <Select
                value={filters.wilaya}
                onValueChange={(value) => {
                  setFilters(prev => ({ ...prev, wilaya: value }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Wilaya" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="">Toutes les wilayas</SelectItem>
                  {WILAYAS.map((w) => (
                    <SelectItem key={w.code} value={w.name}>
                      {w.code} - {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as [Filters['sortBy'], Filters['sortOrder']];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                  <SelectItem value="date-desc">Plus récents</SelectItem>
                  <SelectItem value="date-asc">Plus anciens</SelectItem>
                  <SelectItem value="lastVisit-desc">Dernière visite</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('table')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} patient{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Patient List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1B4F72' }} />
        </div>
      ) : patients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun patient enregistré</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {filters.search || filters.gender !== 'ALL' || filters.wilaya
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier patient pour créer son dossier médical'}
            </p>
            {!filters.search && filters.gender === 'ALL' && !filters.wilaya && (
              <Button 
                asChild
                className="text-white"
                style={{ backgroundColor: '#1B4F72' }}
              >
                <Link href="/dashboard/patients/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un patient
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full shrink-0',
                        patient.gender === 'MALE'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-pink-100 text-pink-600'
                      )}
                    >
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {!patient.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        N° {patient.fileNumber} • {getAgeFromBirthDate(patient.dateOfBirth)} ans
                      </p>
                      {patient.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {formatPhone(patient.phone)}
                        </p>
                      )}
                      {patient.wilaya && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {patient.wilaya}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead>Dernière consultation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/dashboard/patients/${patient.id}`} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                          patient.gender === 'MALE'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-pink-100 text-pink-600'
                        )}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">N° {patient.fileNumber}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{patient.dateOfBirth}</p>
                      <p className="text-xs text-muted-foreground">{getAgeFromBirthDate(patient.dateOfBirth)} ans</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.phone ? formatPhone(patient.phone) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {patient.wilaya || patient.city || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.lastConsultation ? (
                      <div>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {getLastVisitDisplay(patient)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {patient.lastConsultation.chiefComplaint}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/patients/${patient.id}`}>Voir</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/consultations/new?patientId=${patient.id}`}>
                          Consultation
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-8"
                  style={page === pageNum ? { backgroundColor: '#1B4F72' } : {}}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={page === totalPages ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  className="w-8"
                  style={page === totalPages ? { backgroundColor: '#1B4F72' } : {}}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
