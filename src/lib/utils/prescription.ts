/**
 * Calculate BMI (Body Mass Index)
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns Calculated BMI rounded to 1 decimal place, or null if invalid input
 */
export function calculateBMI(weight: number, height: number): number | null {
  if (!weight || !height || weight <= 0 || height <= 0) return null;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
}

/**
 * Generate a sequential prescription number
 * Format: ORD-YYYY-NNNNN
 * @param lastNumber - The last sequential number used (optional)
 * @returns Formatted prescription number
 */
export function generatePrescriptionNumber(lastNumber: number = 0): string {
  const year = new Date().getFullYear();
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `ORD-${year}-${nextNumber}`;
}
