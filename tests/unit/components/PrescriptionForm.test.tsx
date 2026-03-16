import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  arrayMove: (array: any[]) => array,
}));

// Mock MedicationItem
vi.mock('./MedicationItem', () => ({
  __esModule: true,
  MedicationItem: ({ medication, onDelete, onEdit }: any) => (
    <div data-testid="medication-item">
      <span>{medication.medicationName || 'New Medication'}</span>
      <button type="button" onClick={onDelete}>Supprimer</button>
    </div>
  ),
  default: ({ medication, onDelete, onEdit }: any) => (
    <div data-testid="medication-item">
      <span>{medication.medicationName || 'New Medication'}</span>
      <button type="button" onClick={onDelete}>Supprimer</button>
    </div>
  ),
}));

describe('PrescriptionForm Component', () => {
  const mockPatients = [
    { id: 'p1', firstName: 'Ahmed', lastName: 'Benali', fileNumber: '001', dateOfBirth: '01/01/1980', gender: 'MALE' as const },
  ];

  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16'));
  });

  it('can add and remove medications', async () => {
    render(<PrescriptionForm patients={mockPatients} onSubmit={mockSubmit} />);
    
    // Check initial state
    expect(screen.queryByTestId('medication-item')).not.toBeInTheDocument();

    // Click "Ajouter"
    const addButton = screen.getByText(/Ajouter/i);
    fireEvent.click(addButton);

    // Should show one item
    expect(screen.getByTestId('medication-item')).toBeInTheDocument();

    // Click "Supprimer"
    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    // Should be empty again
    expect(screen.queryByTestId('medication-item')).not.toBeInTheDocument();
  });

  it('disables Add button when 10 medications are reached', () => {
    render(<PrescriptionForm patients={mockPatients} onSubmit={mockSubmit} />);
    const addButton = screen.getByText(/Ajouter/i);

    // Add 10 medications
    for (let i = 0; i < 10; i++) {
      fireEvent.click(addButton);
    }

    expect(addButton).toBeDisabled();
  });
});
