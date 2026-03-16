import {
  format,
  parse,
  differenceInYears,
  isToday as dateFnsIsToday,
  getDay,
  getMonth,
  isValid,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns';

/**
 * Format a date to DD/MM/YYYY format
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) {
    return '';
  }
  return format(dateObj, 'dd/MM/yyyy');
}

/**
 * Format a date to DD/MM/YYYY HH:mm format
 * @param date - Date object or string
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) {
    return '';
  }
  return format(dateObj, 'dd/MM/yyyy HH:mm');
}

/**
 * Format a date to HH:mm format
 * @param date - Date object or string
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) {
    return '';
  }
  return format(dateObj, 'HH:mm');
}

/**
 * Parse a DD/MM/YYYY string to Date object
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  return parse(dateString, 'dd/MM/yyyy', new Date());
}

/**
 * Get a date range from today
 * @param days - Number of days for the range
 * @returns Object with start and end dates
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(new Date(), days));
  return { start, end };
}

/**
 * Calculate age from birth date string (DD/MM/YYYY format)
 * @param birthDate - Birth date string in DD/MM/YYYY format
 * @returns Age in years
 */
export function getAgeFromBirthDate(birthDate: string): number {
  const birthDateObj = parseDate(birthDate);
  if (!isValid(birthDateObj)) {
    return 0;
  }
  const age = differenceInYears(new Date(), birthDateObj);
  return age < 0 ? 0 : age;
}

/**
 * Check if a date string represents today
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
  const dateObj = parseDate(dateString);
  if (!isValid(dateObj)) {
    return false;
  }
  return dateFnsIsToday(dateObj);
}

/**
 * Day names in French and Arabic
 */
const DAY_NAMES = {
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

/**
 * Get the day name in the specified locale
 * @param date - Date object
 * @param locale - Locale ('fr' or 'ar')
 * @returns Day name in the specified locale
 */
export function getDayName(date: Date, locale: 'fr' | 'ar'): string {
  const dayIndex = getDay(date);
  return DAY_NAMES[locale][dayIndex];
}

/**
 * Month names in French and Arabic
 */
const MONTH_NAMES = {
  fr: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ],
  ar: [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
};

/**
 * Get the month name in the specified locale
 * @param date - Date object
 * @param locale - Locale ('fr' or 'ar')
 * @returns Month name in the specified locale
 */
export function getMonthName(date: Date, locale: 'fr' | 'ar'): string {
  const monthIndex = getMonth(date);
  return MONTH_NAMES[locale][monthIndex];
}

/**
 * Format date with day and month name
 * @param date - Date object or string
 * @param locale - Locale ('fr' or 'ar')
 * @returns Formatted date string (e.g., "Lundi 15 Janvier 2024")
 */
export function formatDateWithDayName(date: Date | string, locale: 'fr' | 'ar'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) {
    return '';
  }
  const dayName = getDayName(dateObj, locale);
  const monthName = getMonthName(dateObj, locale);
  const day = format(dateObj, 'd');
  const year = format(dateObj, 'yyyy');
  
  if (locale === 'ar') {
    return `${dayName} ${day} ${monthName} ${year}`;
  }
  return `${dayName} ${day} ${monthName} ${year}`;
}

/**
 * Get relative time description (e.g., "Aujourd'hui", "Hier")
 * @param dateString - Date string in DD/MM/YYYY format
 * @param locale - Locale ('fr' or 'ar')
 * @returns Relative time description
 */
export function getRelativeDate(dateString: string, locale: 'fr' | 'ar'): string {
  const dateObj = parseDate(dateString);
  if (!isValid(dateObj)) {
    return '';
  }

  const today = startOfDay(new Date());
  const targetDate = startOfDay(dateObj);
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (locale === 'ar') {
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays === 2) return 'قبل يومين';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return formatDateWithDayName(dateObj, 'ar');
  }

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays === 2) return 'Avant-hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return formatDateWithDayName(dateObj, 'fr');
}
