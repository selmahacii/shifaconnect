'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User } from 'lucide-react';

export interface BookedSlot {
  time: string;
  duration: number;
  patientName?: string;
  status: string;
  appointmentId: string;
}

interface TimeSlotsProps {
  date?: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  bookedSlots?: BookedSlot[];
  selectedTime?: string;
  onTimeSelect?: (time: string) => void;
  workingDays?: number[];
  className?: string;
}

// Generate time slots for a given range
const generateTimeSlots = (
  startHour: number,
  endHour: number,
  slotDuration: number
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return slots;
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-500';
    case 'confirmed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-orange-500';
    case 'completed':
      return 'bg-emerald-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'no_show':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export function TimeSlots({
  date,
  startHour = 8,
  endHour = 18,
  slotDuration = 15,
  bookedSlots = [],
  selectedTime,
  onTimeSelect,
  className,
}: TimeSlotsProps) {
  const slots = React.useMemo(
    () => generateTimeSlots(startHour, endHour, slotDuration),
    [startHour, endHour, slotDuration]
  );

  // Find booked slot info for a given time
  const getBookedSlotInfo = (time: string): BookedSlot | undefined => {
    // Check if this time falls within any booked appointment
    for (const booked of bookedSlots) {
      const [bookedHour, bookedMin] = booked.time.split(':').map(Number);
      const [slotHour, slotMin] = time.split(':').map(Number);
      
      const bookedMinutes = bookedHour * 60 + bookedMin;
      const slotMinutes = slotHour * 60 + slotMin;
      const endMinutes = bookedMinutes + booked.duration;
      
      if (slotMinutes >= bookedMinutes && slotMinutes < endMinutes) {
        return booked;
      }
    }
    return undefined;
  };

  // Check if a slot is available
  const isSlotAvailable = (time: string): boolean => {
    return !getBookedSlotInfo(time);
  };

  // Check if a slot is the start of an appointment
  const isAppointmentStart = (time: string, booked: BookedSlot): boolean => {
    return time === booked.time;
  };

  // Group slots by hour
  const groupedSlots = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    slots.forEach((slot) => {
      const hour = slot.split(':')[0];
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(slot);
    });
    return groups;
  }, [slots]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Créneaux horaires
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-white border" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#1B4F72]" />
            <span>Occupé</span>
          </div>
        </div>
      </div>

      {/* Time slots grid */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
            <div key={hour} className="space-y-1">
              {/* Hour label */}
              <div className="text-xs font-medium text-muted-foreground sticky top-0 bg-white py-1">
                {hour}:00
              </div>
              
              {/* Slots for this hour */}
              <div className="grid grid-cols-4 gap-2">
                {hourSlots.map((slot) => {
                  const bookedInfo = getBookedSlotInfo(slot);
                  const isAvailable = !bookedInfo;
                  const isSelected = selectedTime === slot;
                  const isStart = bookedInfo && isAppointmentStart(slot, bookedInfo);

                  return (
                    <div key={slot} className="relative">
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'w-full h-auto py-2 px-1 text-xs font-normal',
                          isAvailable && 'hover:bg-[#148F77]/10 hover:border-[#148F77]',
                          isSelected && 'bg-[#1B4F72] hover:bg-[#1B4F72]',
                          !isAvailable && 'bg-[#1B4F72]/10 border-[#1B4F72]/30',
                          isStart && 'ring-2 ring-[#F39C12]'
                        )}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && onTimeSelect?.(slot)}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{slot}</span>
                          {!isAvailable && isStart && bookedInfo && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground truncate max-w-full">
                              <User className="h-2.5 w-2.5" />
                              {bookedInfo.patientName || 'Patient'}
                            </span>
                          )}
                        </div>
                      </Button>
                      
                      {/* Duration indicator for booked slots */}
                      {isStart && bookedInfo && bookedInfo.duration > 15 && (
                        <div
                          className="absolute top-0 left-0 h-full pointer-events-none"
                          style={{
                            width: `${(bookedInfo.duration / 15) * 100}%`,
                            maxWidth: '400%',
                            zIndex: -1,
                          }}
                        >
                          <div className={cn(
                            'h-full rounded-r-sm',
                            getStatusColor(bookedInfo.status),
                            'opacity-20'
                          )} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-2 border-t text-xs">
        {bookedSlots.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm ring-2 ring-[#F39C12]" />
            <span>Début de rendez-vous</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeSlots;
