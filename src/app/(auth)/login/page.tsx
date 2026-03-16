'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, Eye, EyeOff, Stethoscope, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { LoginSchema, type LoginSchemaType } from '@/lib/validations/schemas';
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/dashboard';

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur Shifa-Connect',
      });
      router.push(redirect);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez entrer votre adresse email',
      });
      return;
    }

    setResetLoading(true);
    try {
      // Simulate password reset API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        toast({
          title: 'Email envoyé',
          description: 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.',
        });
        setResetDialogOpen(false);
        setResetEmail('');
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email de réinitialisation',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle
          className="text-2xl font-bold"
          style={{ color: '#1B4F72' }}
        >
          Connexion
        </CardTitle>
        <CardDescription className="text-base">
          Connectez-vous à votre cabinet médical
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="exemple@email.com"
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mot de passe</FormLabel>
                    <button
                      type="button"
                      onClick={() => setResetDialogOpen(true)}
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#148F77' }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
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
                  <FormMessage />
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
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: '#148F77' }}
          >
            Créer un compte
          </Link>
        </div>
      </CardFooter>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Réinitialiser le mot de passe
            </DialogTitle>
            <DialogDescription>
              Entrez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="h-11"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={resetLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="text-white"
              style={{ backgroundColor: '#1B4F72' }}
            >
              {resetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
