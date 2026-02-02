import * as authLib from "@/lib/auth";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    user: User | null;
    error: authLib.AuthError | null;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    user: User | null;
    error: authLib.AuthError | null;
  }>;
  signOut: () => Promise<{ error: authLib.AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    authLib.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = authLib.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authLib.signIn(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await authLib.signUp(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await authLib.signOut();
    if (!result.error) {
      setUser(null);
    }
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
