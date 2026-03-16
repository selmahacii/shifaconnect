'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday as isDateToday, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface AppointmentCount {
  date: string; // DD/MM/YYYY format
  count: number;
  confirmed: number;
  pending: number;
}

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  appointmentCounts?: AppointmentCount[];
  workingDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  className?: string;
}

const DAYS_OF_WEEK = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function Calendar({
  selectedDate,
  onDateSelect,
  appointmentCounts = [],
  workingDays = [1, 2, 3, 4, 5, 6], // Mon-Sat by default
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentMonth(new Date());
    onDateSelect?.(new Date());
  };

  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day offset (for empty cells)
  const startOffset = getDay(monthStart);

  // Get appointment count for a date
  const getAppointmentCount = (date: Date): AppointmentCount | undefined => {
    const dateStr = format(date, 'dd/MM/yyyy');
    return appointmentCounts.find((a) => a.date === dateStr);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  // Check if day is a working day
  const isWorkingDay = (date: Date): boolean => {
    return workingDays.includes(getDay(date));
  };

  return (
    <div className={cn('bg-white rounded-lg border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          {!isSameMonth(new Date(), currentMonth) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-7 text-xs text-[#1B4F72] hover:text-[#1B4F72]"
            >
              Aujourd&apos;hui
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-2 text-center text-sm font-medium text-muted-foreground',
              !workingDays.includes(index) && 'text-red-400'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for days before month start */}
        {Array.from({ length: startOffset }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-16 border-b border-r bg-muted/30"
          />
        ))}

        {/* Days of the month */}
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isDateToday(day);
          const isWorkDay = isWorkingDay(day);
          const appointmentData = getAppointmentCount(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateClick(day)}
              className={cn(
                'h-16 border-b border-r p-1 text-left transition-colors',
                'hover:bg-muted/50 focus:outline-none focus:bg-muted/50',
                isSelected && 'bg-[#1B4F72]/10 ring-1 ring-inset ring-[#1B4F72]',
                isToday && !isSelected && 'bg-[#148F77]/10',
                !isWorkDay && 'bg-red-50/50'
              )}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday && 'text-[#148F77]',
                    isSelected && 'text-[#1B4F72]',
                    !isWorkDay && 'text-red-500'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {appointmentData && appointmentData.count > 0 && (
                  <div className="mt-auto">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-5 text-xs px-1.5',
                        appointmentData.count > 5
                          ? 'bg-[#F39C12] text-white hover:bg-[#F39C12]'
                          : 'bg-[#1B4F72] text-white hover:bg-[#1B4F72]'
                      )}
                    >
                      {appointmentData.count}
                    </Badge>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
