/**
 * Format a number as Algerian Dinar currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "2 000 DA")
 */
export function formatCurrency(amount: number): string {
  // Format with space as thousand separator
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} DA`;
}

/**
 * Format an Algerian phone number
 * @param phone - Phone number string (can be with or without country code)
 * @returns Formatted phone number (e.g., "0555 12 34 56")
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  let formattedNumber = cleaned;
  
  // Remove country code if present (213 for Algeria)
  if (formattedNumber.startsWith('213')) {
    formattedNumber = '0' + formattedNumber.slice(3);
  }
  
  // Ensure we have 10 digits starting with 0
  if (formattedNumber.length === 9 && !formattedNumber.startsWith('0')) {
    formattedNumber = '0' + formattedNumber;
  }
  
  // Format as XXX XX XX XX XX
  if (formattedNumber.length === 10) {
    return formattedNumber.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  
  // Return original if not a valid Algerian number format
  return phone;
}

/**
 * Capitalize the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get initials from first and last name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Remove extra whitespace from a string
 * @param str - The string to clean
 * @returns Cleaned string
 */
export function cleanWhitespace(str: string): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Format a name to proper case (capitalize each word)
 * @param name - The name to format
 * @returns Properly formatted name
 */
export function formatName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/\s+/)
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format a file size in bytes to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a percentage value
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "75.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a national identification number (NIN) - 18 digits
 * @param nin - The NIN to format
 * @returns Formatted NIN with spaces
 */
export function formatNIN(nin: string): string {
  const cleaned = nin.replace(/\D/g, '');
  if (cleaned.length !== 18) return nin;
  // Format as: XXXX XXXX XXXX XXXX XX
  return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{2})/, '$1 $2 $3 $4 $5');
}

/**
 * Slugify a string for URLs
 * @param str - The string to slugify
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format a duration in minutes to human readable format
 * @param minutes - Duration in minutes
 * @param locale - Locale ('fr' or 'ar')
 * @returns Formatted duration (e.g., "1h 30min")
 */
export function formatDuration(minutes: number, locale: 'fr' | 'ar' = 'fr'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (locale === 'ar') {
    if (hours === 0) return `${mins} دق`;
    if (mins === 0) return `${hours} س`;
    return `${hours} س ${mins} دق`;
  }
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
