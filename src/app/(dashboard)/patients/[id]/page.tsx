'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Stethoscope,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  User,
  File,
  Loader2,
  MoreVertical,
  Edit,
  UserX,
  Download,
  Plus,
  Clock,
  Activity,
  CreditCard,
  Syringe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getAgeFromBirthDate, formatPhone, formatDate } from '@/lib/utils';

// Types
interface Consultation {
  id: string;
  consultationDate: string;
  consultationTime?: string | null;
  chiefComplaint: string;
  diagnosis?: string | null;
  status: string;
  fee?: number | null;
  paid: boolean;
}

interface Prescription {
  id: string;
  prescriptionDate: string;
  diagnosis?: string | null;
  isValid: boolean;
  items: { medicationName: string }[];
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string | null;
  status: string;
}

interface MedicalDocument {
  id: string;
  title: string;
  documentType: string;
  documentDate?: string | null;
  createdAt: string;
}

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
  currentMedications?: string | null;
  emergencyContact?: string | null;
  nin?: string | null;
  chifaNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  consultations: Consultation[];
  prescriptions: Prescription[];
  documents: MedicalDocument[];
  appointments: Appointment[];
}

// Blood type display
const BLOOD_TYPE_DISPLAY: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
};

// Document type display
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  LAB_RESULT: 'Résultat d\'analyse',
  XRAY: 'Radiographie',
  MRI: 'IRM',
  CT_SCAN: 'Scanner',
  ULTRASOUND: 'Échographie',
  REPORT: 'Rapport médical',
  REFERRAL: 'Lettre d\'orientation',
  CERTIFICATE: 'Certificat médical',
  OTHER: 'Autre',
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.id as string;

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Fetch patient data
  React.useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Patient non trouvé');
          }
          throw new Error('Erreur lors du chargement du patient');
        }
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Handle delete (soft delete)
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      router.push('/dashboard/patients');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1B4F72' }} />
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux patients
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{error || 'Patient non trouvé'}</h3>
            <Button asChild className="mt-4">
              <Link href="/dashboard/patients">Retour aux patients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = getAgeFromBirthDate(patient.dateOfBirth);
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const arabicName = (patient.firstNameAr || patient.lastNameAr)
    ? `${patient.firstNameAr || ''} ${patient.lastNameAr || ''}`.trim()
    : null;

  // Split comma-separated values for display
  const allergiesList = patient.allergies?.split(',').map(a => a.trim()).filter(Boolean) || [];
  const chronicDiseasesList = patient.chronicDiseases?.split(',').map(a => a.trim()).filter(Boolean) || [];
  const medicationsList = patient.currentMedications?.split(',').map(a => a.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/patients">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={cn(
                'flex items-center justify-center w-16 h-16 rounded-full shrink-0',
                patient.gender === 'MALE'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-pink-100 text-pink-600'
              )}
            >
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                {patient.bloodType && (
                  <Badge 
                    variant="outline" 
                    className="text-red-600 border-red-200 bg-red-50"
                  >
                    🩸 {BLOOD_TYPE_DISPLAY[patient.bloodType] || patient.bloodType}
                  </Badge>
                )}
                {!patient.isActive && (
                  <Badge variant="secondary">Inactif</Badge>
                )}
              </div>
              {arabicName && (
                <p className="text-lg text-muted-foreground" dir="rtl">{arabicName}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>N° {patient.fileNumber}</span>
                <span>•</span>
                <span>{age} ans</span>
                <span>•</span>
                <span>{patient.gender === 'MALE' ? 'Masculin' : 'Féminin'}</span>
              </div>
              {patient.chifaNumber && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Chifa: {patient.chifaNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/consultations/new?patientId=${patientId}`}>
              <Stethoscope className="w-4 h-4 mr-2" />
              Consultation
            </Link>
          </Button>
          <Button 
            asChild 
            className="text-white"
            style={{ backgroundColor: '#1B4F72' }}
          >
            <Link href={`/dashboard/agenda?patientId=${patientId}`}>
              <Calendar className="w-4 h-4 mr-2" />
              Rendez-vous
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/patients/${patientId}?edit=true`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Désactiver le patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="summary" className="data-[state=active]:bg-background">
            Résumé médical
          </TabsTrigger>
          <TabsTrigger value="consultations" className="data-[state=active]:bg-background">
            Consultations
            {patient.consultations.length > 0 && (
              <Badge variant="secondary" className="ml-1">{patient.consultations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="data-[state=active]:bg-background">
            Ordonnances
            {patient.prescriptions.length > 0 && (
              <Badge variant="secondary" className="ml-1">{patient.prescriptions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-background">
            Résultats labo
            {patient.documents.length > 0 && (
              <Badge variant="secondary" className="ml-1">{patient.documents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="agenda" className="data-[state=active]:bg-background">
            Agenda
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Résumé médical */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Allergies Card */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allergiesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allergiesList.map((allergy, index) => (
                      <Badge 
                        key={index} 
                        variant="destructive"
                        className="bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune allergie connue</p>
                )}
              </CardContent>
            </Card>

            {/* Chronic Diseases Card */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-orange-500" />
                  Maladies chroniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chronicDiseasesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {chronicDiseasesList.map((disease, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {disease}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune maladie chronique</p>
                )}
              </CardContent>
            </Card>

            {/* Current Medications Card */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Médicaments actuels
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicationsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicationsList.map((med, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {med}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun médicament en cours</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: '#1B4F72' }} />
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formatPhone(patient.phone)}</span>
                  </div>
                )}
                {patient.phoneSecondary && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatPhone(patient.phoneSecondary)}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
                {(patient.address || patient.city || patient.wilaya) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {patient.address && <p>{patient.address}</p>}
                      <p className="text-muted-foreground">
                        {[patient.city, patient.wilaya].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {patient.emergencyContact && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Contact d'urgence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{patient.emergencyContact}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {patient.notes && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Notes médicales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Historique consultations */}
        <TabsContent value="consultations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historique des consultations</h3>
            <Button asChild>
              <Link href={`/dashboard/consultations/new?patientId=${patientId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle consultation
              </Link>
            </Button>
          </div>
          
          {patient.consultations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune consultation</h3>
                <p className="text-muted-foreground mb-4">
                  Ce patient n'a pas encore de consultation enregistrée
                </p>
                <Button asChild>
                  <Link href={`/dashboard/consultations/new?patientId=${patientId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle consultation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.consultations.map((consultation) => (
                <Link key={consultation.id} href={`/dashboard/consultations/${consultation.id}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: '#1B4F72' }}
                          >
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{formatDate(consultation.consultationDate)}</p>
                              {consultation.consultationTime && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {consultation.consultationTime}
                                </span>
                              )}
                              <Badge variant="outline">{consultation.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {consultation.chiefComplaint}
                            </p>
                            {consultation.diagnosis && (
                              <p className="text-sm mt-1">
                                <span className="text-muted-foreground">Diagnostic: </span>
                                {consultation.diagnosis}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {consultation.fee && (
                            <p className="font-medium">{consultation.fee.toLocaleString()} DA</p>
                          )}
                          <Badge variant={consultation.paid ? "success" : "secondary"} className="mt-1">
                            {consultation.paid ? 'Payé' : 'Non payé'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Ordonnances */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ordonnances</h3>
            <Button asChild>
              <Link href={`/dashboard/prescriptions/new?patientId=${patientId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle ordonnance
              </Link>
            </Button>
          </div>
          
          {patient.prescriptions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune ordonnance</h3>
                <p className="text-muted-foreground mb-4">
                  Ce patient n'a pas encore d'ordonnance
                </p>
                <Button asChild>
                  <Link href={`/dashboard/prescriptions/new?patientId=${patientId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une ordonnance
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.prescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: '#148F77' }}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{formatDate(prescription.prescriptionDate)}</p>
                            <Badge 
                              variant={prescription.isValid ? "success" : "secondary"}
                            >
                              {prescription.isValid ? 'Active' : 'Expirée'}
                            </Badge>
                          </div>
                          {prescription.diagnosis && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {prescription.diagnosis}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {prescription.items.length} médicament(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                            Voir
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: Résultats labo */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Résultats d'analyses</h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          </div>
          
          {patient.documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Syringe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
                <p className="text-muted-foreground mb-4">
                  Aucun résultat d'analyse enregistré pour ce patient
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patient.documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: '#F39C12' }}
                      >
                        <File className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.documentDate || formatDate(doc.createdAt)}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 5: Agenda */}
        <TabsContent value="agenda" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rendez-vous</h3>
            <Button asChild>
              <Link href={`/dashboard/agenda?patientId=${patientId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau rendez-vous
              </Link>
            </Button>
          </div>
          
          {patient.appointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
                <p className="text-muted-foreground mb-4">
                  Ce patient n'a pas de rendez-vous programmé
                </p>
                <Button asChild>
                  <Link href={`/dashboard/agenda?patientId=${patientId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Prendre rendez-vous
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: '#1B4F72' }}
                        >
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatDate(appointment.appointmentDate)} à {appointment.appointmentTime}
                          </p>
                          {appointment.reason && (
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{appointment.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver le patient</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver ce patient ? Le dossier sera marqué comme inactif mais sera conservé dans la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
