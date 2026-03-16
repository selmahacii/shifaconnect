'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Phone, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Pill,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { WILAYAS, BLOOD_TYPES } from '@/lib/utils/constants';
import { 
  PatientCreateSchema, 
  type PatientCreateSchemaType,
  formatDateToDDMMYYYY,
} from '@/lib/validations/schemas';

// Common chronic diseases presets
const CHRONIC_DISEASES_PRESETS = [
  'Diabète type 2',
  'Hypertension artérielle (HTA)',
  'Asthme',
  'Maladie cardiaque',
  'Insuffisance rénale',
  'Thyroïde',
  'Épilepsie',
  'Cancer',
];

// Step configuration
const STEPS = [
  { id: 1, title: 'Identité', icon: User, description: 'Informations personnelles' },
  { id: 2, title: 'Contact', icon: Phone, description: 'Coordonnées' },
  { id: 3, title: 'Antécédents', icon: Heart, description: 'Dossier médical' },
];

interface PatientFormProps {
  onSubmit: (data: PatientCreateSchemaType) => Promise<void>;
  initialData?: Partial<PatientCreateSchemaType>;
  isEditing?: boolean;
}

// Tag Input Component
interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
}

function TagInput({ value, onChange, placeholder, suggestions = [], disabled }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags.join(', '));
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
              disabled={disabled}
            >
              ×
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
          disabled={disabled}
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border rounded-md bg-popover shadow-md max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PatientForm({ onSubmit, initialData, isEditing = false }: PatientFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PatientCreateSchemaType>({
    resolver: zodResolver(PatientCreateSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      firstNameAr: initialData?.firstNameAr || '',
      lastNameAr: initialData?.lastNameAr || '',
      dateOfBirth: initialData?.dateOfBirth || formatDateToDDMMYYYY(new Date()),
      gender: initialData?.gender || 'MALE',
      nin: initialData?.nin || '',
      chifaNumber: initialData?.chifaNumber || '',
      phone: initialData?.phone || '',
      phoneSecondary: initialData?.phoneSecondary || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      wilaya: initialData?.wilaya || '',
      bloodType: initialData?.bloodType,
      allergies: initialData?.allergies || '',
      chronicDiseases: initialData?.chronicDiseases || '',
      currentMedications: initialData?.currentMedications || '',
      emergencyContact: initialData?.emergencyContact || '',
      notes: initialData?.notes || '',
    },
    mode: 'onChange',
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof PatientCreateSchemaType)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['phone'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: PatientCreateSchemaType) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Identité
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* French Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom (FR) *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mohamed" className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom (FR) *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Benali" className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Arabic Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstNameAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم (العربية)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="محمد"
                  className="h-11 text-right"
                  dir="rtl"
                  style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastNameAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اللقب (العربية)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="بن علي"
                  className="h-11 text-right"
                  dir="rtl"
                  style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de naissance *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="DD/MM/YYYY"
                    className="h-11 pl-10"
                    onChange={(e) => {
                      // Auto-format date
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                      if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                      field.onChange(value);
                    }}
                    maxLength={10}
                  />
                </div>
              </FormControl>
              <FormDescription>Format: JJ/MM/AAAA</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4 h-11 items-center"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <label htmlFor="male" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-blue-600">♂</span> Masculin
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <label htmlFor="female" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-pink-600">♀</span> Féminin
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* NIN and Chifa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro NIN</FormLabel>
              <FormControl>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="18 chiffres"
                    className="h-11 pl-10"
                    maxLength={18}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>Numéro d'identification national (18 chiffres)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chifaNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro Chifa</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input {...field} placeholder="Numéro carte Chifa" className="h-11 pl-10" />
                </div>
              </FormControl>
              <FormDescription>Numéro de la carte Chifa (optionnel)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Step 2: Contact
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    type="tel"
                    placeholder="0555123456"
                    className="h-11 pl-10"
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>10 chiffres commençant par 05, 06 ou 07</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneSecondary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone secondaire</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    type="tel"
                    placeholder="0555123456"
                    className="h-11 pl-10"
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="patient@email.com" className="h-11" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse</FormLabel>
            <FormControl>
              <Input {...field} placeholder="123 Rue Didouche Mourad" className="h-11" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Alger" className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wilaya"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wilaya</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner une wilaya" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {WILAYAS.map((w) => (
                    <SelectItem key={w.code} value={w.name}>
                      {w.code} - {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Step 3: Antécédents médicaux
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Blood Type */}
      <FormField
        control={form.control}
        name="bloodType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Groupe sanguin</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-11 w-full md:w-1/3">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BLOOD_TYPES.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value}>
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">🩸</span>
                      {bt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Allergies */}
      <FormField
        control={form.control}
        name="allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Allergies
            </FormLabel>
            <FormControl>
              <TagInput
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Tapez une allergie et appuyez sur Entrée..."
                suggestions={['Pénicilline', 'Aspirine', 'Sulfamides', 'Iode', 'Latex', 'Arachides']}
              />
            </FormControl>
            <FormDescription>
              Tapez et appuyez sur Entrée pour ajouter plusieurs allergies
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Chronic Diseases */}
      <FormField
        control={form.control}
        name="chronicDiseases"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-orange-500" />
              Maladies chroniques
            </FormLabel>
            <FormControl>
              <TagInput
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Tapez une maladie et appuyez sur Entrée..."
                suggestions={CHRONIC_DISEASES_PRESETS}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Current Medications */}
      <FormField
        control={form.control}
        name="currentMedications"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" />
              Médicaments en cours
            </FormLabel>
            <FormControl>
              <TagInput
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Tapez un médicament et appuyez sur Entrée..."
                suggestions={['Metformine', 'Insuline', 'Amlodipine', 'Oméprazole', 'Aspirine']}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Emergency Contact */}
      <FormField
        control={form.control}
        name="emergencyContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact d'urgence</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nom et numéro de téléphone"
                className="h-11"
              />
            </FormControl>
            <FormDescription>Personne à contacter en cas d'urgence</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes médicales</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Notes privées sur le patient..."
                className="min-h-[100px] resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
                      isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      isCompleted && 'bg-primary text-primary-foreground',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-16 sm:w-24 mx-2 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="gap-2"
              style={{ backgroundColor: '#1B4F72' }}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
              style={{ backgroundColor: '#1B4F72' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Enregistrer les modifications' : 'Créer le patient'}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
