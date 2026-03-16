import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PatientCard } from '@/components/patients/PatientCard';
import type { PatientCardData } from '@/components/patients/PatientCard';

// Mock utils
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getAgeFromBirthDate: vi.fn().mockReturnValue(40),
    formatPhone: vi.fn().mockImplementation(p => p),
  };
});

describe('PatientCard Component', () => {
  const mockPatient: PatientCardData = {
    id: 'uuid-123',
    fileNumber: 'P-2026-00001',
    firstName: 'Ahmed',
    lastName: 'Benali',
    dateOfBirth: '20/04/1985',
    gender: 'MALE',
    phone: '0661234567',
    isActive: true,
    bloodType: 'A_POSITIVE',
    allergies: 'Pénicilline, Aspirine',
    chronicDiseases: 'Diabète type 2',
  };

  it('renders patient full name and age correctly', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('Ahmed Benali')).toBeInTheDocument();
    expect(screen.getByText('40 ans')).toBeInTheDocument();
  });

  it('displays blood type badge', () => {
    render(<PatientCard patient={mockPatient} />);
    // A_POSITIVE -> A+
    expect(screen.getByText('A+')).toBeInTheDocument();
  });

  it('displays medical badges correctly', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('Pénicilline')).toBeInTheDocument();
    expect(screen.getByText('Aspirine')).toBeInTheDocument();
    expect(screen.getByText('Diabète type 2')).toBeInTheDocument();
  });

  it('does not render medical badges if data is missing', () => {
    const minimalPatient = { ...mockPatient, allergies: null, chronicDiseases: null, bloodType: null };
    render(<PatientCard patient={minimalPatient} />);
    expect(screen.queryByText('Pénicilline')).not.toBeInTheDocument();
    expect(screen.queryByText('Diabète type 2')).not.toBeInTheDocument();
  });
});
