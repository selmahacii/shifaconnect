'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Doctor, RegisterFormData } from '@/types/database';

interface ExtendedRegisterFormData extends RegisterFormData {
  licenseNumber?: string;
  wilaya?: string;
  clinicName?: string;
}

interface AuthState {
  user: User | null;
  doctor: Doctor | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: ExtendedRegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null, doctor: Doctor | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      doctor: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user, doctor) => {
        set({
          user,
          doctor,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Erreur de connexion');
          }

          set({
            user: data.data.user,
            doctor: data.data.doctor,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, user: null, doctor: null });
          throw error;
        }
      },

      register: async (data: ExtendedRegisterFormData) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const responseData = await response.json();

          if (!response.ok || !responseData.success) {
            throw new Error(responseData.error || 'Erreur lors de l\'inscription');
          }

          set({
            user: responseData.data.user,
            doctor: responseData.data.doctor,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, user: null, doctor: null });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch {
          // Ignore logout API errors
        } finally {
          set({
            user: null,
            doctor: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchUser: async () => {
        const { isAuthenticated } = get();
        
        // Always check session with server
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();

          if (response.ok && data.success) {
            set({
              user: data.data.user,
              doctor: data.data.doctor,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              doctor: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            user: null,
            doctor: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'shifa-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        doctor: state.doctor,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
