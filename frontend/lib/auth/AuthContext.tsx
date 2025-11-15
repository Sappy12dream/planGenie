'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -------- Authentication Actions --------

  const signIn = async (email: string, password: string) => {
    const { session } = await authService.signIn(email, password);
    setSession(session);
    setUser(session?.user ?? null);
    router.push('/'); // no reload
  };

  const signUp = async (email: string, password: string) => {
    const { session } = await authService.signUp(email, password);
    setSession(session);
    setUser(session?.user ?? null);
    router.push('/');
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle(); // Supabase will redirect itself
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }

    setSession(null);
    setUser(null);

    router.push('/auth/login'); // clean redirect
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
