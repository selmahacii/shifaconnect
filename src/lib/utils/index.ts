// Date utilities
export {
  formatDate,
  formatDateTime,
  formatTime,
  parseDate,
  getDateRange,
  getAgeFromBirthDate,
  isToday,
  getDayName,
  getMonthName,
  formatDateWithDayName,
  getRelativeDate,
} from './dates';

// Formatting utilities
export {
  formatCurrency,
  formatPhone,
  capitalize,
  getInitials,
  truncate,
  cleanWhitespace,
  formatName,
  formatFileSize,
  formatPercentage,
  formatNIN,
  slugify,
  formatDuration,
} from './format';

// Constants
export {
  // Location constants
  WILAYAS,
  type Wilaya,
  
  // Blood types
  BLOOD_TYPES,
  type BloodType,
  
  // Medical constants
  GENDERS,
  type Gender,
  MEDICAL_SPECIALTIES,
  type Specialty,
  CONSULTATION_TYPES,
  type ConsultationType,
  MEDICAL_RECORD_TYPES,
  type MedicalRecordType,
  
  // Status constants
  CONSULTATION_STATUS,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PRESCRIPTION_STATUS,
  type Status,
  
  // User and scheduling constants
  USER_ROLES,
  type UserRole,
  DAYS_OF_WEEK,
  type DayOfWeek,
  
  // Application configuration
  APP_CONFIG,
  
  // Validation constants
  VALIDATION,
  
  // Pagination defaults
  PAGINATION,
  
  // File upload constants
  FILE_UPLOAD,
} from './constants';
