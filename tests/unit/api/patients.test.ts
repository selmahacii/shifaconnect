import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/patients/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  db: {
    patient: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    doctor: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Patients API Route', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16'));
    vi.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('returns a list of patients with pagination mapping', async () => {
      const mockPatients = [
        { id: '1', firstName: 'Ahmed', lastName: 'Benali', consultations: [] },
      ];
      (db.patient.count as any).mockResolvedValue(1);
      (db.patient.findMany as any).mockResolvedValue(mockPatients);

      const req = new NextRequest('http://localhost/api/patients?page=1&limit=10');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.patients).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(db.patient.findMany).toHaveBeenCalled();
    });

    it('filters by search query', async () => {
      const req = new NextRequest('http://localhost/api/patients?search=Ahmed');
      await GET(req);

      expect(db.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('POST /api/patients', () => {
    const validData = {
      firstName: 'Ahmed',
      lastName: 'Benali',
      dateOfBirth: '20/04/1985',
      gender: 'MALE',
      phone: '0661234567',
      phoneSecondary: '',
      nin: '',
      chifaNumber: '',
    };

    it('creates a patient successfully', async () => {
      (db.doctor.findFirst as any).mockResolvedValue({ id: 'doc-1' });
      (db.patient.findFirst as any).mockResolvedValue(null); // No previous patients for file number
      (db.patient.create as any).mockResolvedValue({ id: 'new-p', ...validData });

      const req = new NextRequest('http://localhost/api/patients', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      const response = await POST(req);
      const data = await response.json();

      if (response.status !== 201) {
        console.log('Validation errors:', data.errors || data.error);
      }

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(db.patient.create).toHaveBeenCalled();
    });

    it('returns 400 for invalid data', async () => {
      const invalidData = { ...validData, phone: '123' }; // Invalid phone
      const req = new NextRequest('http://localhost/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});
