/**
 * SUPABASE DATABASE TYPES
 * Matching the exact schema defined in SQL
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string
          auth_user_id: string | null
          full_name: string
          full_name_ar: string | null
          speciality: string | null
          license_number: string | null
          clinic_name: string | null
          clinic_address: string | null
          clinic_wilaya: string | null
          phone: string | null
          stamp_image_url: string | null
          signature_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          full_name: string
          full_name_ar?: string | null
          speciality?: string | null
          license_number?: string | null
          clinic_name?: string | null
          clinic_address?: string | null
          clinic_wilaya?: string | null
          phone?: string | null
          stamp_image_url?: string | null
          signature_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          full_name?: string
          full_name_ar?: string | null
          speciality?: string | null
          license_number?: string | null
          clinic_name?: string | null
          clinic_address?: string | null
          clinic_wilaya?: string | null
          phone?: string | null
          stamp_image_url?: string | null
          signature_image_url?: string | null
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          doctor_id: string
          first_name: string
          last_name: string
          first_name_ar: string | null
          last_name_ar: string | null
          date_of_birth: string
          gender: 'M' | 'F'
          national_id: string | null
          chifa_number: string | null
          phone: string | null
          address: string | null
          wilaya: string | null
          blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
          allergies: string[] | null
          chronic_conditions: string[] | null
          current_medications: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          first_name: string
          last_name: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          date_of_birth: string
          gender: 'M' | 'F'
          national_id?: string | null
          chifa_number?: string | null
          phone?: string | null
          address?: string | null
          wilaya?: string | null
          blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
          allergies?: string[] | null
          chronic_conditions?: string[] | null
          current_medications?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          first_name?: string
          last_name?: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          date_of_birth?: string
          gender?: 'M' | 'F'
          national_id?: string | null
          chifa_number?: string | null
          phone?: string | null
          address?: string | null
          wilaya?: string | null
          blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
          allergies?: string[] | null
          chronic_conditions?: string[] | null
          current_medications?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          consultation_date: string
          chief_complaint: string
          symptoms: string | null
          diagnosis: string | null
          diagnosis_code: string | null
          clinical_notes: string | null
          blood_pressure_systolic: number | null
          blood_pressure_diastolic: number | null
          heart_rate: number | null
          temperature: number | null
          weight: number | null
          height: number | null
          oxygen_saturation: number | null
          followup_date: string | null
          followup_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          consultation_date?: string
          chief_complaint: string
          symptoms?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          clinical_notes?: string | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          heart_rate?: number | null
          temperature?: number | null
          weight?: number | null
          height?: number | null
          oxygen_saturation?: number | null
          followup_date?: string | null
          followup_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          consultation_date?: string
          chief_complaint?: string
          symptoms?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          clinical_notes?: string | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          heart_rate?: number | null
          temperature?: number | null
          weight?: number | null
          height?: number | null
          oxygen_saturation?: number | null
          followup_date?: string | null
          followup_notes?: string | null
          created_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          consultation_id: string
          patient_id: string
          doctor_id: string
          prescription_number: string | null
          prescription_date: string
          medications: Json
          instructions: string | null
          is_renewable: boolean
          renewal_count: number
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consultation_id: string
          patient_id: string
          doctor_id: string
          prescription_number?: string | null
          prescription_date?: string
          medications: Json
          instructions?: string | null
          is_renewable?: boolean
          renewal_count?: number
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consultation_id?: string
          patient_id?: string
          doctor_id?: string
          prescription_number?: string | null
          prescription_date?: string
          medications?: Json
          instructions?: string | null
          is_renewable?: boolean
          renewal_count?: number
          pdf_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          duration_minutes: number
          reason: string | null
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          duration_minutes?: number
          reason?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          duration_minutes?: number
          reason?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
        }
      }
      lab_results: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          consultation_id: string | null
          result_date: string
          lab_name: string | null
          result_type: string | null
          file_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          consultation_id?: string | null
          result_date: string
          lab_name?: string | null
          result_type?: string | null
          file_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          consultation_id?: string | null
          result_date?: string
          lab_name?: string | null
          result_type?: string | null
          file_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * MEDICATION TYPE FOR JSONB
 */
export interface MedicationItem {
  name: string
  dosage: string
  form: string
  frequency: string
  duration: string
  quantity: string
  instructions: string
}

/**
 * APPLICATION TYPES (CamelCase)
 */

export interface Doctor {
  id: string
  authUserId: string | null
  fullName: string
  fullNameAr: string | null
  speciality: string
  licenseNumber: string | null
  clinicName: string | null
  clinicAddress: string | null
  clinicWilaya: string | null
  phone: string | null
  stampImageUrl: string | null
  signatureImageUrl: string | null
  createdAt: Date
}

export interface Patient {
  id: string
  doctorId: string
  firstName: string
  lastName: string
  firstNameAr: string | null
  lastNameAr: string | null
  dateOfBirth: Date
  gender: 'M' | 'F'
  nationalId: string | null
  chifaNumber: string | null
  phone: string | null
  address: string | null
  wilaya: string | null
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
  allergies: string[]
  chronicConditions: string[]
  currentMedications: string[]
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Consultation {
  id: string
  patientId: string
  doctorId: string
  consultationDate: Date
  chiefComplaint: string
  symptoms: string | null
  diagnosis: string | null
  diagnosisCode: string | null
  clinicalNotes: string | null
  vitals: {
    bloodPressureSystolic: number | null
    bloodPressureDiastolic: number | null
    heartRate: number | null
    temperature: number | null
    weight: number | null
    height: number | null
    oxygenSaturation: number | null
  }
  followUp: {
    date: Date | null
    notes: string | null
  }
  createdAt: Date
}

export interface Prescription {
  id: string
  consultationId: string
  patientId: string
  doctorId: string
  prescriptionNumber: string | null
  prescriptionDate: Date
  medications: MedicationItem[]
  instructions: string | null
  isRenewable: boolean
  renewalCount: number
  pdfUrl: string | null
  createdAt: Date
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: Date
  durationMinutes: number
  reason: string | null
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  createdAt: Date
}

/**
 * HELPER TYPE FOR SUPABASE RESPONSES
 */
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = { error: { message: string; details: string; hint: string; code: string } }
