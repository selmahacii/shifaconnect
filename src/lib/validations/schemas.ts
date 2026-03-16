// ============================================
// Shifa-Connect Zod Validation Schemas
// Medical Practice Management SaaS for Algerian Private Doctors
// All error messages in French
// ============================================

import { z } from 'zod';

// ============================================
// CUSTOM VALIDATION HELPERS
// ============================================

/**
 * Validates Algerian phone numbers
 * Format: 10 digits starting with 0
 * Examples: 0555123456, 0661234567, 0771234567
 */
const algerianPhoneRegex = /^0[5-7]\d{8}$/;

const algerianPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || algerianPhoneRegex.test(val),
    'Le numéro de téléphone doit contenir 10 chiffres commençant par 0'
  );

/**
 * Validates date in DD/MM/YYYY format
 */
const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

const dateSchema = z
  .string()
  .regex(dateRegex, 'La date doit être au format JJ/MM/AAAA')
  .refine((val) => {
    const date = parseDDMMYYYYToDate(val);
    return date ? date <= new Date() : false;
  }, 'La date ne peut pas être dans le futur');

const optionalDateSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || dateRegex.test(val),
    'La date doit être au format JJ/MM/AAAA'
  );

/**
 * Validates time in HH:mm format
 */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeSchema = z
  .string()
  .regex(timeRegex, 'L\'heure doit être au format HH:mm');

const optionalTimeSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || timeRegex.test(val),
    'L\'heure doit être au format HH:mm'
  );

/**
 * Validates email format
 */
const emailSchema = z
  .string()
  .min(1, 'L\'adresse email est requise')
  .email('Veuillez entrer une adresse email valide');

// ============================================
// ENUM SCHEMAS
// ============================================

export const GenderSchema = z.enum(['M', 'F']);

export const BloodTypeSchema = z.enum([
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]);

export const ConsultationStatusSchema = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const AppointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const PaymentMethodSchema = z.enum([
  'CASH',
  'CARD',
  'CHEQUE',
  'INSURANCE',
  'FREE',
]);

export const UserRoleSchema = z.enum(['DOCTOR', 'ADMIN', 'ASSISTANT']);

// ============================================
// PATIENT SCHEMA
// ============================================

/**
 * Validates NIN (National Identification Number) - 15 digits
 */
const ninRegex = /^\d{15}$/;
const ninSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => !val || ninRegex.test(val),
    'Le numéro NIN doit contenir exactement 15 chiffres'
  );

/**
 * Validates Chifa number - alphanumeric, up to 20 characters
 */
const chifaSchema = z
  .string()
  .max(20, 'Le numéro Chifa ne peut pas dépasser 20 caractères')
  .optional();

export const PatientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  firstNameAr: z
    .string()
    .max(100, 'Le prénom en arabe ne peut pas dépasser 100 caractères')
    .optional(),
  lastNameAr: z
    .string()
    .max(100, 'Le nom en arabe ne peut pas dépasser 100 caractères')
    .optional(),
  dateOfBirth: dateSchema,
  gender: GenderSchema,
  phone: algerianPhoneSchema,
  phoneSecondary: algerianPhoneSchema,
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),
  city: z
    .string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .optional(),
  wilaya: z
    .string()
    .max(100, 'La wilaya ne peut pas dépasser 100 caractères')
    .optional(),
  bloodType: BloodTypeSchema.optional(),
  allergies: z
    .string()
    .max(1000, 'Les allergies ne peuvent pas dépasser 1000 caractères')
    .optional(),
  chronicDiseases: z
    .string()
    .max(1000, 'Les maladies chroniques ne peuvent pas dépasser 1000 caractères')
    .optional(),
  emergencyContact: z
    .string()
    .max(200, 'Le contact d\'urgence ne peut pas dépasser 200 caractères')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Les notes ne peuvent pas dépasser 2000 caractères')
    .optional(),
});

export type PatientSchemaType = z.infer<typeof PatientSchema>;

// ============================================
// PATIENT CREATE/UPDATE SCHEMAS
// ============================================

export const PatientCreateSchema = z.object({
  // Step 1 - Identité
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  firstNameAr: z.string().optional().or(z.literal('')),
  lastNameAr: z.string().optional().or(z.literal('')),
  dateOfBirth: dateSchema,
  gender: GenderSchema,
  nin: ninSchema,
  chifaNumber: chifaSchema,

  // Step 2 - Contact
  phone: algerianPhoneSchema,
  address: z.string().optional().or(z.literal('')),
  wilaya: z.string().min(1, 'La wilaya est requise'),

  // Step 3 - Antécédents médicaux
  bloodGroup: BloodTypeSchema.optional().or(z.literal('')),
  allergies: z.array(z.string()),
  chronicConditions: z.array(z.string()),
  currentMedications: z.array(z.string()),
  notes: z.string().optional().or(z.literal('')),
});

export type PatientCreateSchemaType = z.infer<typeof PatientCreateSchema>;

export const PatientUpdateSchema = PatientCreateSchema.partial();

export type PatientUpdateSchemaType = z.infer<typeof PatientUpdateSchema>;

// ============================================
// CONSULTATION SCHEMA
// ============================================

export const ConsultationSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  motif: z.string().min(1, 'Le motif de consultation est requis'),
  symptoms: z.string().optional(),
  
  // Examen clinique (Constantes)
  systolicBP: z.coerce.number().optional(),
  diastolicBP: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  oxygenSaturation: z.coerce.number().optional(),
  
  // Diagnostic
  diagnosis: z.string().min(1, 'Le diagnostic est requis'),
  icdCode: z.string().optional(),
  clinicalNotes: z.string().optional(),
  
  // Suivi
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  
  // UI Actions (Quick checkboxes)
  createPrescription: z.boolean().default(false).optional(),
  scheduleFollowUp: z.boolean().default(false).optional(),
  uploadLabResult: z.boolean().default(false).optional(),
});

export type ConsultationSchemaType = z.infer<typeof ConsultationSchema>;

// ============================================
// PRESCRIPTION ITEM SCHEMA
// ============================================

export const PrescriptionItemSchema = z.object({
  id: z.string().optional(),
  medicationName: z
    .string()
    .min(1, 'Le nom du médicament est requis')
    .max(200, 'Le nom du médicament ne peut pas dépasser 200 caractères'),
  medicationNameAr: z
    .string()
    .max(200, 'Le nom du médicament en arabe ne peut pas dépasser 200 caractères')
    .optional(),
  dosage: z
    .string()
    .min(1, 'Le dosage est requis')
    .max(50, 'Le dosage ne peut pas dépasser 50 caractères'),
  form: z.string().optional(),
  frequency: z
    .string()
    .min(1, 'La fréquence est requise')
    .max(100, 'La fréquence ne peut pas dépasser 100 caractères'),
  frequencyAr: z
    .string()
    .max(100, 'La fréquence en arabe ne peut pas dépasser 100 caractères')
    .optional(),
  duration: z
    .string()
    .min(1, 'La durée est requise')
    .max(100, 'La durée ne peut pas dépasser 100 caractères'),
  durationAr: z
    .string()
    .max(100, 'La durée en arabe ne peut pas dépasser 100 caractères')
    .optional(),
  quantity: z
    .string()
    .max(50, 'La quantité ne peut pas dépasser 50 caractères')
    .optional(),
  instructions: z
    .string()
    .max(500, 'Les instructions ne peuvent pas dépasser 500 caractères')
    .optional(),
  instructionsAr: z
    .string()
    .max(500, 'Les instructions en arabe ne peuvent pas dépasser 500 caractères')
    .optional(),
  renewal: z.boolean().default(false),
  order: z.number().default(0),
});

export type PrescriptionItemSchemaType = z.infer<typeof PrescriptionItemSchema>;

// ============================================
// PRESCRIPTION SCHEMA
// ============================================

export const PrescriptionSchema = z.object({
  patientId: z
    .string()
    .min(1, 'Veuillez sélectionner un patient'),
  consultationId: z.string().optional(),
  prescriptionDate: dateSchema,
  diagnosis: z
    .string()
    .max(2000, 'Le diagnostic ne peut pas dépasser 2000 caractères')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),
  items: z
    .array(PrescriptionItemSchema)
    .min(1, 'Au moins un médicament est requis')
    .max(10, 'Le nombre maximum de médicaments est de 10'),
});

export type PrescriptionSchemaType = z.infer<typeof PrescriptionSchema>;

// ============================================
// APPOINTMENT SCHEMA
// ============================================

export const AppointmentSchema = z.object({
  patientId: z.string().optional(),
  appointmentDate: dateSchema,
  appointmentTime: timeSchema,
  duration: z
    .number()
    .min(5, 'La durée minimale est de 5 minutes')
    .max(480, 'La durée maximale est de 8 heures (480 minutes)')
    .default(15),
  reason: z
    .string()
    .max(500, 'Le motif ne peut pas dépasser 500 caractères')
    .optional(),
  reasonAr: z
    .string()
    .max(500, 'Le motif en arabe ne peut pas dépasser 500 caractères')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),
  status: AppointmentStatusSchema.optional(),
});

export type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

// ============================================
// DOCTOR SCHEMA
// ============================================

export const DoctorSchema = z.object({
  professionalTitle: z
    .string()
    .max(50, 'Le titre professionnel ne peut pas dépasser 50 caractères')
    .optional(),
  specialization: z
    .string()
    .max(200, 'La spécialisation ne peut pas dépasser 200 caractères')
    .optional(),
  licenseNumber: z
    .string()
    .max(50, 'Le numéro de licence ne peut pas dépasser 50 caractères')
    .optional(),
  wilaya: z
    .string()
    .max(100, 'La wilaya ne peut pas dépasser 100 caractères')
    .optional(),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),
  city: z
    .string()
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .optional(),
  postalCode: z
    .string()
    .max(10, 'Le code postal ne peut pas dépasser 10 caractères')
    .optional(),
  clinicPhone: algerianPhoneSchema,
  clinicName: z
    .string()
    .max(200, 'Le nom de la clinique ne peut pas dépasser 200 caractères')
    .optional(),
  consultationFee: z
    .number()
    .min(0, 'Les honoraires ne peuvent pas être négatifs')
    .max(100000000, 'Les honoraires sont trop élevés')
    .optional(),
  workingHours: z.string().optional(),
});

export type DoctorSchemaType = z.infer<typeof DoctorSchema>;

// ============================================
// USER SCHEMA
// ============================================

export const UserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  phone: algerianPhoneSchema,
  role: UserRoleSchema.optional(),
});

export type UserSchemaType = z.infer<typeof UserSchema>;

// ============================================
// LOGIN SCHEMA
// ============================================

export const LoginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

// ============================================
// REGISTER SCHEMA
// ============================================

export const RegisterSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Veuillez confirmer votre mot de passe'),
    name: z
      .string()
      .min(1, 'Le nom est requis')
      .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    phone: algerianPhoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

// ============================================
// SEARCH/FILTER SCHEMAS
// ============================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const PatientListSchema = PaginationSchema.extend({
  search: z.string().max(100).optional(),
  gender: GenderSchema.optional(),
  bloodType: BloodTypeSchema.optional(),
  isActive: z.boolean().optional(),
  wilaya: z.string().max(100).optional(),
});

export const ConsultationListSchema = PaginationSchema.extend({
  patientId: z.string().optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  status: ConsultationStatusSchema.optional(),
});

export const AppointmentListSchema = PaginationSchema.extend({
  patientId: z.string().optional(),
  date: optionalDateSchema,
  status: AppointmentStatusSchema.optional(),
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format a date string to DD/MM/YYYY format
 */
export function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse a DD/MM/YYYY date string to Date object
 */
export function parseDDMMYYYYToDate(dateStr: string): Date | null {
  const match = dateStr.match(dateRegex);
  if (!match) return null;
  
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Format a time string to HH:mm format
 */
export function formatTimeToHHMM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Validate and sanitize form data
 * Returns either the validated data or an error object
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });

  return { success: false, errors };
}
