'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  FileText,
  MapPin,
  Building2,
  Check,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { WILAYAS } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Extended registration schema with clinic_name
const RegisterFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().regex(/^0[5-7]\d{8}$/, 'Numéro de téléphone invalide (10 chiffres commençant par 0)'),
  clinicName: z.string().min(2, 'Le nom du cabinet est requis').optional(),
  licenseNumber: z.string().optional(),
  wilaya: z.string().min(1, 'Veuillez sélectionner une wilaya'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof RegisterFormSchema>;

// Password strength calculation
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;

  if (score < 30) return { score, label: 'Très faible', color: '#EF4444' };
  if (score < 50) return { score, label: 'Faible', color: '#F97316' };
  if (score < 70) return { score, label: 'Moyen', color: '#EAB308' };
  if (score < 90) return { score, label: 'Fort', color: '#22C55E' };
  return { score: 100, label: 'Très fort', color: '#148F77' };
}

// Password requirement check
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Une minuscule', met: /[a-z]/.test(password) },
    { label: 'Un chiffre', met: /\d/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <Check className="h-3 w-3" style={{ color: '#148F77' }} />
          ) : (
            <X className="h-3 w-3 text-gray-300" />
          )}
          <span className={req.met ? 'text-green-600' : 'text-gray-400'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      clinicName: '',
      licenseNumber: '',
      wilaya: '',
      acceptTerms: false,
    },
  });

  const password = form.watch('password');
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: data.name,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        wilaya: data.wilaya,
        clinicName: data.clinicName,
      });
      toast({
        title: 'Compte créé',
        description: 'Bienvenue sur Shifa-Connect ! Votre cabinet a été enregistré.',
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  };

  return (
    <>
      <CardHeader className="text-center pb-2">
        <CardTitle
          className="text-xl font-bold"
          style={{ color: '#1B4F72' }}
        >
          Créer un compte
        </CardTitle>
        <CardDescription>
          Inscrivez votre cabinet médical sur Shifa-Connect
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[65vh] overflow-y-auto px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Dr. Mohamed Benali"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email professionnelle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="docteur@cabinet-dz.com"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="0555123456"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Name */}
            <FormField
              control={form.control}
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du cabinet</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Cabinet Médical Benali"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License Number */}
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° d&apos;inscription à l&apos;Ordre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Ex: 12345"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wilaya */}
            <FormField
              control={form.control}
              name="wilaya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wilaya</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Sélectionnez votre wilaya" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {WILAYAS.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.name}>
                          {wilaya.code} - {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Créez un mot de passe sécurisé"
                        className="pl-10 pr-10 h-11"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Force du mot de passe
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.score}
                        className="h-1.5"
                        style={{
                          ['--progress-background' as string]: passwordStrength.color,
                        }}
                      />
                      <PasswordRequirements password={password} />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmez votre mot de passe"
                        className="pl-10 pr-10 h-11"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms Checkbox */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-sm">
                      J&apos;accepte les{' '}
                      <Link
                        href="#"
                        className="font-semibold hover:underline"
                        style={{ color: '#148F77' }}
                      >
                        conditions d&apos;utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link
                        href="#"
                        className="font-semibold hover:underline"
                        style={{ color: '#148F77' }}
                      >
                        politique de confidentialité
                      </Link>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold text-base"
              style={{ backgroundColor: '#1B4F72' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2">
        <div className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: '#148F77' }}
          >
            Se connecter
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
