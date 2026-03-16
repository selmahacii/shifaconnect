'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Clock, User, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APPOINTMENT_STATUS } from '@/lib/utils/constants';
import { AppointmentSchema, AppointmentSchemaType, formatDateToDDMMYYYY } from '@/lib/validations/schemas';
import { PatientSearch, type PatientSearchResult } from '@/components/patients/PatientSearch';

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentSchemaType> & { patient?: PatientSearchResult };
  onSubmit: (data: AppointmentSchemaType) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  availableSlots?: string[];
  bookedSlots?: string[];
  className?: string;
}

// Duration options
const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' },
];

// Generate time slots from 08:00 to 18:00
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function AppointmentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  bookedSlots = [],
  className,
}: AppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = React.useState<PatientSearchResult | null>(
    defaultValues?.patient || null
  );
  const [searchResults, setSearchResults] = React.useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    defaultValues?.appointmentDate
      ? new Date(defaultValues.appointmentDate.split('/').reverse().join('-'))
      : new Date()
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      appointmentDate: defaultValues?.appointmentDate || formatDateToDDMMYYYY(new Date()),
      appointmentTime: defaultValues?.appointmentTime || '09:00',
      duration: defaultValues?.duration || 15,
      reason: defaultValues?.reason || '',
      notes: defaultValues?.notes || '',
      status: defaultValues?.status || 'SCHEDULED',
      patientId: defaultValues?.patientId,
    },
  });

  const watchedTime = watch('appointmentTime');
  const watchedDuration = watch('duration');
  const watchedStatus = watch('status');

  // Handle patient search
  const handlePatientSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.patients || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setValue('patientId', patient.id);
    setSearchResults([]);
  };

  // Clear patient selection
  const handleClearPatient = () => {
    setSelectedPatient(null);
    setValue('patientId', undefined);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue('appointmentDate', formatDateToDDMMYYYY(date));
    }
  };

  // Handle form submission
  const onFormSubmit = async (data: AppointmentSchemaType) => {
    await onSubmit(data);
  };

  // Check if slot is booked
  const isSlotBooked = (time: string) => bookedSlots.includes(time);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1B4F72]">
          <CalendarIcon className="h-5 w-5" />
          {defaultValues?.appointmentDate ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient
            </Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                      selectedPatient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                    )}
                  >
                    {selectedPatient.firstName[0]}
                    {selectedPatient.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      N° {selectedPatient.fileNumber}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearPatient}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <PatientSearch
                onSearch={handlePatientSearch}
                onSelect={handlePatientSelect}
                results={searchResults}
                isLoading={isSearching}
                placeholder="Rechercher un patient..."
              />
            )}
            {errors.patientId && (
              <p className="text-sm text-red-500">{errors.patientId.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
                    ) : (
                      'Sélectionner une date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.appointmentDate && (
                <p className="text-sm text-red-500">{errors.appointmentDate.message}</p>
              )}
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heure
              </Label>
              <Select
                value={watchedTime}
                onValueChange={(value) => setValue('appointmentTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'heure" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={isSlotBooked(time)}
                      className={cn(isSlotBooked(time) && 'opacity-50')}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{time}</span>
                        {isSlotBooked(time) && (
                          <Badge variant="outline" className="text-xs text-red-500">
                            Occupé
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appointmentTime && (
                <p className="text-sm text-red-500">{errors.appointmentTime.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label>Durée</Label>
              <Select
                value={watchedDuration?.toString()}
                onValueChange={(value) => setValue('duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la durée" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as AppointmentSchemaType['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value.toUpperCase()}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Motif de la visite
            </Label>
            <Textarea
              {...register('reason')}
              placeholder="Décrivez le motif de la consultation..."
              rows={3}
              className="resize-none"
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes additionnelles</Label>
            <Textarea
              {...register('notes')}
              placeholder="Notes privées (non visibles par le patient)..."
              rows={2}
              className="resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                defaultValues?.appointmentDate ? 'Modifier' : 'Créer le rendez-vous'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AppointmentForm;
