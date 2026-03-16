// ============================================
// Shifa-Connect TypeScript Types
// Medical Practice Management SaaS for Algerian Private Doctors
// ============================================

// ============================================
// ENUM TYPES
// ============================================

export type UserRole = 'DOCTOR' | 'ADMIN' | 'ASSISTANT';

export type Gender = 'MALE' | 'FEMALE';

export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type ConsultationStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentMethod = 'CASH' | 'CARD' | 'CHEQUE' | 'INSURANCE' | 'FREE';

export type DocumentType =
  | 'LAB_RESULT'
  | 'XRAY'
  | 'MRI'
  | 'CT_SCAN'
  | 'ULTRASOUND'
  | 'REPORT'
  | 'REFERRAL'
  | 'CERTIFICATE'
  | 'OTHER';

// ============================================
// DISPLAY LABEL HELPERS
// ============================================

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'M',
  FEMALE: 'F',
};

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
};

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
  SCHEDULED: 'Programmée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  NO_SHOW: 'Absence',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Programmé',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Absence',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  CHEQUE: 'Chèque',
  INSURANCE: 'Assurance',
  FREE: 'Gratuit',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  LAB_RESULT: 'Résultat d\'analyse',
  XRAY: 'Radiographie',
  MRI: 'IRM',
  CT_SCAN: 'Scanner',
  ULTRASOUND: 'Échographie',
  REPORT: 'Rapport médical',
  REFERRAL: 'Lettre de orientation',
  CERTIFICATE: 'Certificat médical',
  OTHER: 'Autre',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  DOCTOR: 'Médecin',
  ADMIN: 'Administrateur',
  ASSISTANT: 'Assistant',
};

// ============================================
// DATABASE ENTITY TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  professionalTitle: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  wilaya: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  clinicPhone: string | null;
  clinicName: string | null;
  consultationFee: number;
  workingHours: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  doctorId: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  firstNameAr: string | null;
  lastNameAr: string | null;
  dateOfBirth: string; // DD/MM/YYYY format
  gender: Gender;
  phone: string | null;
  phoneSecondary: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  wilaya: string | null;
  bloodType: BloodType | null;
  allergies: string | null;
  chronicDiseases: string | null;
  emergencyContact: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  consultationDate: string; // DD/MM/YYYY format
  consultationTime: string | null; // HH:mm format
  chiefComplaint: string;
  chiefComplaintAr: string | null;
  presentIllness: string | null;
  presentIllnessAr: string | null;
  examinationNotes: string | null;
  examinationNotesAr: string | null;
  diagnosis: string | null;
  diagnosisAr: string | null;
  icdCode: string | null;
  treatmentPlan: string | null;
  treatmentPlanAr: string | null;
  followUpDate: string | null; // DD/MM/YYYY format
  followUpNotes: string | null;
  vitals: string | null; // JSON string
  fee: number | null;
  paid: boolean;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  status: ConsultationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  consultationId: string | null;
  prescriptionDate: string; // DD/MM/YYYY format
  diagnosis: string | null;
  notes: string | null;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicationName: string;
  medicationNameAr: string | null;
  dosage: string;
  frequency: string;
  frequencyAr: string | null;
  duration: string;
  durationAr: string | null;
  quantity: number | null;
  instructions: string | null;
  instructionsAr: string | null;
  order: number;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string | null;
  appointmentDate: string; // DD/MM/YYYY format
  appointmentTime: string; // HH:mm format
  duration: number;
  reason: string | null;
  reasonAr: string | null;
  notes: string | null;
  status: AppointmentStatus;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalDocument {
  id: string;
  doctorId: string;
  patientId: string;
  consultationId: string | null;
  documentType: DocumentType;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  documentDate: string | null; // DD/MM/YYYY format
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ============================================
// VITALS TYPE (parsed from JSON)
// ============================================

export interface Vitals {
  bloodPressure?: string; // e.g., "120/80"
  temperature?: string; // e.g., "37.5"
  pulse?: string; // e.g., "72"
  weight?: string; // e.g., "70"
  height?: string; // e.g., "175"
}

// ============================================
// FORM TYPES (for creating/editing entities)
// ============================================

export interface PatientFormData {
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth: string; // DD/MM/YYYY format
  gender: Gender;
  phone?: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  city?: string;
  wilaya?: string;
  bloodType?: BloodType;
  allergies?: string;
  chronicDiseases?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface ConsultationFormData {
  patientId: string;
  consultationDate: string; // DD/MM/YYYY format
  consultationTime?: string; // HH:mm format
  chiefComplaint: string;
  chiefComplaintAr?: string;
  presentIllness?: string;
  presentIllnessAr?: string;
  examinationNotes?: string;
  examinationNotesAr?: string;
  diagnosis?: string;
  diagnosisAr?: string;
  icdCode?: string;
  treatmentPlan?: string;
  treatmentPlanAr?: string;
  followUpDate?: string; // DD/MM/YYYY format
  followUpNotes?: string;
  vitals?: Vitals;
  fee?: number;
  paid?: boolean;
  paymentMethod?: PaymentMethod;
  notes?: string;
  status?: ConsultationStatus;
}

export interface PrescriptionFormData {
  patientId: string;
  consultationId?: string;
  prescriptionDate: string; // DD/MM/YYYY format
  diagnosis?: string;
  notes?: string;
  items: PrescriptionItemFormData[];
}

export interface PrescriptionItemFormData {
  medicationName: string;
  medicationNameAr?: string;
  dosage: string;
  frequency: string;
  frequencyAr?: string;
  duration: string;
  durationAr?: string;
  quantity?: number;
  instructions?: string;
  instructionsAr?: string;
}

export interface AppointmentFormData {
  patientId?: string;
  appointmentDate: string; // DD/MM/YYYY format
  appointmentTime: string; // HH:mm format
  duration?: number;
  reason?: string;
  reasonAr?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface DoctorFormData {
  professionalTitle?: string;
  specialization?: string;
  licenseNumber?: string;
  wilaya?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  clinicPhone?: string;
  clinicName?: string;
  consultationFee?: number;
  workingHours?: string;
}

export interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

// ============================================
// AUTH FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientWithRelations extends Patient {
  consultations?: Consultation[];
  appointments?: Appointment[];
  prescriptions?: Prescription[];
  medicalDocuments?: MedicalDocument[];
}

export interface ConsultationWithRelations extends Consultation {
  patient?: Patient;
  prescriptions?: Prescription[];
}

export interface PrescriptionWithRelations extends Prescription {
  patient?: Patient;
  consultation?: Consultation;
  items?: PrescriptionItem[];
}

export interface AppointmentWithRelations extends Appointment {
  patient?: Patient;
}

export interface DoctorWithUser extends Doctor {
  user: User;
}

// ============================================
// DASHBOARD/STATS TYPES
// ============================================

export interface DashboardStats {
  totalPatients: number;
  totalConsultations: number;
  todayAppointments: number;
  thisMonthRevenue: number;
  pendingPayments: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  consultations: number;
}

// ============================================
// LIST/PARAMS TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PatientListParams extends PaginationParams {
  search?: string;
  gender?: Gender;
  bloodType?: BloodType;
  isActive?: boolean;
  wilaya?: string;
}

export interface ConsultationListParams extends PaginationParams {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  status?: ConsultationStatus;
}

export interface AppointmentListParams extends PaginationParams {
  patientId?: string;
  date?: string;
  status?: AppointmentStatus;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithId<T> = T & { id: string };

export type TimestampFields = {
  createdAt: Date;
  updatedAt: Date;
};
