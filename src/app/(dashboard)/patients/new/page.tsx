'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PatientForm } from '@/components/patients';
import { useToast } from '@/hooks/use-toast';
import type { PatientCreateSchemaType } from '@/lib/validations/schemas';

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: PatientCreateSchemaType) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la création du patient');
      }

      toast({
        title: 'Patient créé',
        description: `Le dossier de ${data.firstName} ${data.lastName} a été créé avec succès.`,
      });

      router.push(`/dashboard/patients/${result.data.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-6 h-6" style={{ color: '#1B4F72' }} />
            Nouveau patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un nouveau dossier patient en 3 étapes
          </p>
        </div>
      </div>

      {/* Form */}
      <PatientForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
}
