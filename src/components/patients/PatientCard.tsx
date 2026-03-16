'use client';

import * as React from 'react';
import Link from 'next/link';
import { User, Phone, FileText, Calendar, Edit, Eye, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAgeFromBirthDate, formatPhone } from '@/lib/utils';

export interface PatientCardData {
  id: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phone?: string | null;
  isActive: boolean;
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
}

interface PatientCardProps {
  patient: PatientCardData;
  onNewConsultation?: (patientId: string) => void;
  className?: string;
}

export function PatientCard({ patient, onNewConsultation, className }: PatientCardProps) {
  const age = getAgeFromBirthDate(patient.dateOfBirth);
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const hasArabicName = patient.firstNameAr || patient.lastNameAr;
  const arabicName = hasArabicName 
    ? `${patient.firstNameAr || ''} ${patient.lastNameAr || ''}`.trim() 
    : null;

  const handleNewConsultation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNewConsultation?.(patient.id);
  };

  return (
    <Card className={cn('group hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Patient Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Avatar with gender icon */}
            <div 
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full shrink-0',
                patient.gender === 'MALE' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-pink-100 text-pink-600'
              )}
            >
              <User className="w-6 h-6" />
            </div>

            {/* Name and details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {fullName}
                </h3>
                {!patient.isActive && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Inactif
                  </Badge>
                )}
              </div>
              
              {arabicName && (
                <p className="text-sm text-muted-foreground truncate" dir="rtl">
                  {arabicName}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                {/* Age */}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {age} ans
                </span>

                {/* File Number */}
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  N° {patient.fileNumber}
                </span>

                {/* Phone */}
                {patient.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {formatPhone(patient.phone)}
                  </span>
                )}
              </div>

              {/* Medical Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {patient.bloodType && (
                  <Badge variant="outline" className="border-primary text-primary font-bold">
                    {patient.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}
                  </Badge>
                )}
                {patient.allergies && patient.allergies.split(',').map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                    {allergy.trim()}
                  </Badge>
                ))}
                {patient.chronicDiseases && patient.chronicDiseases.split(',').map((disease, i) => (
                  <Badge key={i} className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                    {disease.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8"
            >
              <Link href={`/patients/${patient.id}`}>
                <Eye className="w-4 h-4" />
                <span className="sr-only">Voir</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8"
            >
              <Link href={`/patients/${patient.id}?edit=true`}>
                <Edit className="w-4 h-4" />
                <span className="sr-only">Modifier</span>
              </Link>
            </Button>
            {onNewConsultation && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary hover:text-secondary"
                onClick={handleNewConsultation}
              >
                <Stethoscope className="w-4 h-4" />
                <span className="sr-only">Nouvelle consultation</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PatientCard;
