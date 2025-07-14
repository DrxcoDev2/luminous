'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isDashboardPage = pathname.startsWith('/dashboard');

    // If the user is not logged in and tries to access a protected dashboard page,
    // redirect them to the login page.
    if (!user && isDashboardPage) {
      router.push('/login');
    }

    // If the user is logged in and tries to access the login or register page,
    // redirect them to their dashboard.
    if (user && isAuthPage) {
      router.push('/dashboard');
    }
    // No action is needed for public pages like the homepage, so we don't add an else block.
    // This allows unauthenticated users to browse public content without waiting for auth checks.

  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
