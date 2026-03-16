'use client';

import * as React from 'react';
import { Clock, User, MoreVertical, Check, X, Play, Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APPOINTMENT_STATUS } from '@/lib/utils/constants';

export interface AppointmentCardData {
  id: string;
  appointmentTime: string;
  duration: number;
  reason?: string | null;
  status: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    gender: 'MALE' | 'FEMALE';
  } | null;
}

interface AppointmentCardProps {
  appointment: AppointmentCardData;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onStartConsultation?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  isCompact?: boolean;
  className?: string;
}

// Status color mapping
const getStatusStyles = (status: string): { bg: string; text: string; label: string } => {
  const statusInfo = APPOINTMENT_STATUS.find((s) => s.value === status.toLowerCase());
  switch (status.toLowerCase()) {
    case 'scheduled':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Programmé' };
    case 'confirmed':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmé' };
    case 'in_progress':
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En cours' };
    case 'completed':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Terminé' };
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulé' };
    case 'no_show':
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Absent' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: statusInfo?.label || status };
  }
};

export function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onStartConsultation,
  onView,
  onEdit,
  isCompact = false,
  className,
}: AppointmentCardProps) {
  const statusStyles = getStatusStyles(appointment.status);
  const patient = appointment.patient;

  // Format time display
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(appointment.appointmentTime, appointment.duration);

  if (isCompact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md border bg-white hover:shadow-sm transition-shadow cursor-pointer',
          className
        )}
        onClick={() => onView?.(appointment.id)}
      >
        <div className="flex-shrink-0">
          <Badge className={cn(statusStyles.bg, statusStyles.text, 'font-normal')}>
            {formatTimeDisplay(appointment.appointmentTime)}
          </Badge>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient non assigné'}
          </p>
          {appointment.reason && (
            <p className="text-xs text-muted-foreground truncate">{appointment.reason}</p>
          )}
        </div>
        <Badge variant="outline" className={cn('text-xs', statusStyles.bg, statusStyles.text)}>
          {statusStyles.label}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Time and duration */}
          <div className="flex items-center gap-2 text-[#1B4F72]">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {formatTimeDisplay(appointment.appointmentTime)} - {endTime}
            </span>
            <span className="text-xs text-muted-foreground">
              ({appointment.duration} min)
            </span>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(appointment.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(appointment.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {appointment.status === 'SCHEDULED' && (
                <DropdownMenuItem
                  onClick={() => onConfirm?.(appointment.id)}
                  className="text-[#148F77]"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmer
                </DropdownMenuItem>
              )}
              {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                <DropdownMenuItem
                  onClick={() => onStartConsultation?.(appointment.id)}
                  className="text-[#1B4F72]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Démarrer consultation
                </DropdownMenuItem>
              )}
              {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                <DropdownMenuItem
                  onClick={() => onCancel?.(appointment.id)}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Patient info */}
        <div className="mt-3">
          {patient ? (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                  patient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                )}
              >
                {patient.firstName[0]}
                {patient.lastName[0]}
              </div>
              <div>
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                </p>
                {patient.phone && (
                  <p className="text-sm text-muted-foreground">{patient.phone}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-5 w-5" />
              <span className="text-sm italic">Patient non assigné</span>
            </div>
          )}
        </div>

        {/* Reason */}
        {appointment.reason && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {appointment.reason}
          </p>
        )}

        {/* Status badge */}
        <div className="mt-3 flex items-center justify-between">
          <Badge className={cn(statusStyles.bg, statusStyles.text, 'font-normal')}>
            {statusStyles.label}
          </Badge>

          {/* Quick action buttons */}
          {appointment.status === 'SCHEDULED' && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-[#148F77] border-[#148F77] hover:bg-[#148F77] hover:text-white"
                onClick={() => onConfirm?.(appointment.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Confirmer
              </Button>
            </div>
          )}
          {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
            <Button
              size="sm"
              className="h-7 text-xs bg-[#1B4F72] hover:bg-[#1B4F72]/90"
              onClick={() => onStartConsultation?.(appointment.id)}
            >
              <Play className="h-3 w-3 mr-1" />
              Démarrer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;
