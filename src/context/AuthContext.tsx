import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, SignUpInput } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileRow {
  id: string;
  full_name: string;
  blood_group: Profile['bloodGroup'];
  phone: string;
  city: string;
  is_available: boolean;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, blood_group, phone, city, is_available')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as ProfileRow;
  return {
    id: row.id,
    fullName: row.full_name,
    bloodGroup: row.blood_group,
    phone: row.phone,
    city: row.city,
    isAvailable: row.is_available,
  };
}

function toFriendlyAuthError(message: string): Error {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return new Error('The email or password is incorrect.');
  }
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return new Error('An account with this email already exists. Try logging in instead.');
  }
  if (lower.includes('password')) {
    return new Error('Password must be at least 6 characters.');
  }
  if (lower.includes('valid email')) {
    return new Error('Enter a valid email address.');
  }
  return new Error('Something went wrong. Please try again.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        setSession(nextSession);
        try {
          setProfile(nextSession ? await fetchProfile(nextSession.user.id) : null);
        } catch {
          setProfile(null);
        } finally {
          setIsLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw toFriendlyAuthError(error.message);
      },
      signUp: async (input) => {
        const { data, error } = await supabase.auth.signUp({
          email: input.email.trim(),
          password: input.password,
          options: {
            data: {
              full_name: input.fullName.trim(),
              blood_group: input.bloodGroup,
              phone: input.phone.trim(),
              city: input.city.trim(),
            },
          },
        });
        if (error) throw toFriendlyAuthError(error.message);
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: input.email.trim(),
            password: input.password,
          });
          if (signInError) throw toFriendlyAuthError(signInError.message);
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
