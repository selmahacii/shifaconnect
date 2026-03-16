import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generatePrescriptionNumber, 
  calculateBMI 
} from '@/lib/utils/prescription';

describe('Prescription & Medical Utilities', () => {
  describe('generatePrescriptionNumber', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-16'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return format ORD-YYYY-NNNNN', () => {
      const result = generatePrescriptionNumber(0);
      expect(result).toMatch(/^ORD-2026-\d{5}$/);
      expect(result).toBe('ORD-2026-00001');
    });

    it('should increment correctly', () => {
      expect(generatePrescriptionNumber(5)).toBe('ORD-2026-00006');
      expect(generatePrescriptionNumber(999)).toBe('ORD-2026-01000');
    });
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly and round to 1 decimal', () => {
      // 70 / (1.75 * 1.75) = 22.857... -> 22.9
      expect(calculateBMI(70, 175)).toBe(22.9);
      // 100 / (1.7 * 1.7) = 34.602... -> 34.6
      expect(calculateBMI(100, 170)).toBe(34.6);
    });

    it('should return null for invalid inputs', () => {
      expect(calculateBMI(0, 175)).toBeNull();
      expect(calculateBMI(70, 0)).toBeNull();
      // @ts-ignore
      expect(calculateBMI(null, 175)).toBeNull();
    });
  });
});
