/**
 * Algerian Wilayas (Provinces)
 * 48 provinces with their codes, French names, and Arabic names
 */
export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
}

export const WILAYAS: Wilaya[] = [
  { code: '01', name: 'Adrar', nameAr: 'أدرار' },
  { code: '02', name: 'Chlef', nameAr: 'الشلف' },
  { code: '03', name: 'Laghouat', nameAr: 'الأغواط' },
  { code: '04', name: 'Oum El Bouaghi', nameAr: 'أم البواقي' },
  { code: '05', name: 'Batna', nameAr: 'باتنة' },
  { code: '06', name: 'Béjaïa', nameAr: 'بجاية' },
  { code: '07', name: 'Biskra', nameAr: 'بسكرة' },
  { code: '08', name: 'Béchar', nameAr: 'بشار' },
  { code: '09', name: 'Blida', nameAr: 'البليدة' },
  { code: '10', name: 'Bouira', nameAr: 'البويرة' },
  { code: '11', name: 'Tamanrasset', nameAr: 'تمنراست' },
  { code: '12', name: 'Tébessa', nameAr: 'تبسة' },
  { code: '13', name: 'Tlemcen', nameAr: 'تلمسان' },
  { code: '14', name: 'Tiaret', nameAr: 'تيارت' },
  { code: '15', name: 'Tizi Ouzou', nameAr: 'تيزي وزو' },
  { code: '16', name: 'Alger', nameAr: 'الجزائر' },
  { code: '17', name: 'Djelfa', nameAr: 'الجلفة' },
  { code: '18', name: 'Jijel', nameAr: 'جيجل' },
  { code: '19', name: 'Sétif', nameAr: 'سطيف' },
  { code: '20', name: 'Saïda', nameAr: 'سعيدة' },
  { code: '21', name: 'Skikda', nameAr: 'سكيكدة' },
  { code: '22', name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس' },
  { code: '23', name: 'Annaba', nameAr: 'عنابة' },
  { code: '24', name: 'Guelma', nameAr: 'قالمة' },
  { code: '25', name: 'Constantine', nameAr: 'قسنطينة' },
  { code: '26', name: 'Médéa', nameAr: 'المدية' },
  { code: '27', name: 'Mostaganem', nameAr: 'مستغانم' },
  { code: '28', name: 'M\'Sila', nameAr: 'المسيلة' },
  { code: '29', name: 'Mascara', nameAr: 'معسكر' },
  { code: '30', name: 'Ouargla', nameAr: 'ورقلة' },
  { code: '31', name: 'Oran', nameAr: 'وهران' },
  { code: '32', name: 'El Bayadh', nameAr: 'البيض' },
  { code: '33', name: 'Illizi', nameAr: 'إليزي' },
  { code: '34', name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج' },
  { code: '35', name: 'Boumerdès', nameAr: 'بومرداس' },
  { code: '36', name: 'El Tarf', nameAr: 'الطارف' },
  { code: '37', name: 'Tindouf', nameAr: 'تندوف' },
  { code: '38', name: 'Tissemsilt', nameAr: 'تيسمسيلت' },
  { code: '39', name: 'El Oued', nameAr: 'الوادي' },
  { code: '40', name: 'Khenchela', nameAr: 'خنشلة' },
  { code: '41', name: 'Souk Ahras', nameAr: 'سوق أهراس' },
  { code: '42', name: 'Tipaza', nameAr: 'تيبازة' },
  { code: '43', name: 'Mila', nameAr: 'ميلة' },
  { code: '44', name: 'Aïn Defla', nameAr: 'عين الدفلى' },
  { code: '45', name: 'Naâma', nameAr: 'النعامة' },
  { code: '46', name: 'Aïn Témouchent', nameAr: 'عين تموشنت' },
  { code: '47', name: 'Ghardaïa', nameAr: 'غرداية' },
  { code: '48', name: 'Relizane', nameAr: 'غليزان' },
];

/**
 * Blood Types
 */
export interface BloodType {
  value: string;
  label: string;
  labelAr: string;
}

export const BLOOD_TYPES: BloodType[] = [
  { value: 'A_POSITIVE', label: 'A+', labelAr: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-', labelAr: 'A-' },
  { value: 'B_POSITIVE', label: 'B+', labelAr: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-', labelAr: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+', labelAr: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-', labelAr: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+', labelAr: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-', labelAr: 'O-' },
];

/**
 * Genders
 */
export interface Gender {
  value: string;
  label: string;
  labelAr: string;
}

export const GENDERS: Gender[] = [
  { value: 'MALE', label: 'Masculin', labelAr: 'ذكر' },
  { value: 'FEMALE', label: 'Féminin', labelAr: 'أنثى' },
];

/**
 * Consultation Status
 */
export interface Status {
  value: string;
  label: string;
  labelAr: string;
  color: string;
}

export const CONSULTATION_STATUS: Status[] = [
  { value: 'pending', label: 'En attente', labelAr: 'في الانتظار', color: 'yellow' },
  { value: 'in_progress', label: 'En cours', labelAr: 'جارية', color: 'blue' },
  { value: 'completed', label: 'Terminée', labelAr: 'مكتملة', color: 'green' },
  { value: 'cancelled', label: 'Annulée', labelAr: 'ملغاة', color: 'red' },
];

/**
 * Appointment Status
 */
export const APPOINTMENT_STATUS: Status[] = [
  { value: 'scheduled', label: 'Programmé', labelAr: 'مجدول', color: 'blue' },
  { value: 'confirmed', label: 'Confirmé', labelAr: 'مؤكد', color: 'green' },
  { value: 'in_progress', label: 'En cours', labelAr: 'جاري', color: 'orange' },
  { value: 'completed', label: 'Terminé', labelAr: 'مكتمل', color: 'green' },
  { value: 'cancelled', label: 'Annulé', labelAr: 'ملغى', color: 'red' },
  { value: 'no_show', label: 'Absent', labelAr: 'غائب', color: 'gray' },
];

/**
 * Payment Status
 */
export const PAYMENT_STATUS: Status[] = [
  { value: 'pending', label: 'En attente', labelAr: 'في الانتظار', color: 'yellow' },
  { value: 'paid', label: 'Payé', labelAr: 'مدفوع', color: 'green' },
  { value: 'partial', label: 'Partiel', labelAr: 'جزئي', color: 'orange' },
  { value: 'refunded', label: 'Remboursé', labelAr: 'مسترد', color: 'purple' },
  { value: 'cancelled', label: 'Annulé', labelAr: 'ملغى', color: 'red' },
];

/**
 * Prescription Status
 */
export const PRESCRIPTION_STATUS: Status[] = [
  { value: 'active', label: 'Active', labelAr: 'نشطة', color: 'green' },
  { value: 'completed', label: 'Terminée', labelAr: 'مكتملة', color: 'blue' },
  { value: 'expired', label: 'Expirée', labelAr: 'منتهية', color: 'gray' },
  { value: 'cancelled', label: 'Annulée', labelAr: 'ملغاة', color: 'red' },
];

/**
 * Medical Record Types
 */
export interface MedicalRecordType {
  value: string;
  label: string;
  labelAr: string;
}

export const MEDICAL_RECORD_TYPES: MedicalRecordType[] = [
  { value: 'consultation', label: 'Consultation', labelAr: 'استشارة' },
  { value: 'prescription', label: 'Ordonnance', labelAr: 'وصفة طبية' },
  { value: 'lab_result', label: 'Résultat d\'analyse', labelAr: 'نتيجة تحليل' },
  { value: 'imaging', label: 'Imagerie', labelAr: 'تصوير طبي' },
  { value: 'certificate', label: 'Certificat', labelAr: 'شهادة طبية' },
  { value: 'report', label: 'Rapport', labelAr: 'تقرير' },
];

/**
 * User Roles
 */
export interface UserRole {
  value: string;
  label: string;
  labelAr: string;
}

export const USER_ROLES: UserRole[] = [
  { value: 'admin', label: 'Administrateur', labelAr: 'مدير' },
  { value: 'doctor', label: 'Médecin', labelAr: 'طبيب' },
  { value: 'nurse', label: 'Infirmier(ère)', labelAr: 'ممرض(ة)' },
  { value: 'receptionist', label: 'Réceptionniste', labelAr: 'موظف استقبال' },
  { value: 'patient', label: 'Patient', labelAr: 'مريض' },
];

/**
 * Medical Specialties
 */
export interface Specialty {
  value: string;
  label: string;
  labelAr: string;
}

export const MEDICAL_SPECIALTIES: Specialty[] = [
  { value: 'general', label: 'Médecine générale', labelAr: 'طب عام' },
  { value: 'cardiology', label: 'Cardiologie', labelAr: 'طب القلب' },
  { value: 'dermatology', label: 'Dermatologie', labelAr: 'طب الجلدية' },
  { value: 'endocrinology', label: 'Endocrinologie', labelAr: 'طب الغدد الصماء' },
  { value: 'gastroenterology', label: 'Gastro-entérologie', labelAr: 'طب الجهاز الهضمي' },
  { value: 'gynecology', label: 'Gynécologie', labelAr: 'طب النساء' },
  { value: 'neurology', label: 'Neurologie', labelAr: 'طب الأعصاب' },
  { value: 'ophthalmology', label: 'Ophtalmologie', labelAr: 'طب العيون' },
  { value: 'orthopedics', label: 'Orthopédie', labelAr: 'طب العظام' },
  { value: 'pediatrics', label: 'Pédiatrie', labelAr: 'طب الأطفال' },
  { value: 'psychiatry', label: 'Psychiatrie', labelAr: 'الطب النفسي' },
  { value: 'radiology', label: 'Radiologie', labelAr: 'الأشعة' },
  { value: 'surgery', label: 'Chirurgie', labelAr: 'جراحة' },
  { value: 'urology', label: 'Urologie', labelAr: 'طب المسالك البولية' },
  { value: 'dentistry', label: 'Dentisterie', labelAr: 'طب الأسنان' },
];

/**
 * Days of the Week for Schedule
 */
export interface DayOfWeek {
  value: number; // 0-6, where 0 is Sunday
  label: string;
  labelAr: string;
  shortLabel: string;
  shortLabelAr: string;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { value: 0, label: 'Dimanche', labelAr: 'الأحد', shortLabel: 'Dim', shortLabelAr: 'أحد' },
  { value: 1, label: 'Lundi', labelAr: 'الإثنين', shortLabel: 'Lun', shortLabelAr: 'إثن' },
  { value: 2, label: 'Mardi', labelAr: 'الثلاثاء', shortLabel: 'Mar', shortLabelAr: 'ثلا' },
  { value: 3, label: 'Mercredi', labelAr: 'الأربعاء', shortLabel: 'Mer', shortLabelAr: 'أرب' },
  { value: 4, label: 'Jeudi', labelAr: 'الخميس', shortLabel: 'Jeu', shortLabelAr: 'خمي' },
  { value: 5, label: 'Vendredi', labelAr: 'الجمعة', shortLabel: 'Ven', shortLabelAr: 'جمع' },
  { value: 6, label: 'Samedi', labelAr: 'السبت', shortLabel: 'Sam', shortLabelAr: 'سبت' },
];

/**
 * Consultation Types
 */
export interface ConsultationType {
  value: string;
  label: string;
  labelAr: string;
  defaultDuration: number; // in minutes
}

export const CONSULTATION_TYPES: ConsultationType[] = [
  { value: 'first_visit', label: 'Première consultation', labelAr: 'استشارة أولى', defaultDuration: 30 },
  { value: 'follow_up', label: 'Suivi', labelAr: 'متابعة', defaultDuration: 15 },
  { value: 'emergency', label: 'Urgence', labelAr: 'طوارئ', defaultDuration: 20 },
  { value: 'checkup', label: 'Bilan', labelAr: 'فحص شامل', defaultDuration: 45 },
  { value: 'procedure', label: 'Acte médical', labelAr: 'إجراء طبي', defaultDuration: 30 },
];

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: 'Shifa Connect',
  nameAr: 'شفاء كونكت',
  defaultLocale: 'fr' as const,
  supportedLocales: ['fr', 'ar'] as const,
  currency: {
    code: 'DZD',
    symbol: 'DA',
    name: 'Dinar Algérien',
    nameAr: 'دينار جزائري',
  },
  timeFormat: '24h' as const,
  dateFormat: 'DD/MM/YYYY' as const,
};

/**
 * Validation Constants
 */
export const VALIDATION = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  phone: {
    minLength: 10,
    maxLength: 10,
    pattern: /^0[5-7]\d{8}$/,
  },
  nin: {
    length: 18,
    pattern: /^\d{18}$/,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
};

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
};

/**
 * File Upload Constants
 */
export const FILE_UPLOAD = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFilesPerUpload: 5,
};
