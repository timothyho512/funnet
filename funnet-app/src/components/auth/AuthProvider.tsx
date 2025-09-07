// TODO(human): Implement authentication context provider
// Reference: https://supabase.com/docs/guides/auth/quickstarts/nextjs
// Reference: https://react.dev/reference/react/createContext
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

// Define what the context will provide
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the Context

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Build the Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // What do you do with the session here?
      // How do you extract the user?
      // How do you update the loading state?
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // what happens when auth state changes
      setUser(session?.user ?? null);
    });

    // Call the initial session function
    getInitialSession();

    // Return cleanup function
    return () => subscription.unsubscribe();
  }, []);
  // TODO: signOut function
  const signOut = async () => {
    // call the supabase sign out method
    await supabase.auth.signOut();
    // Let listener handle the state update
    // Possible: Add error handling when building UI
  };
  // TODO: return the Provider JSX
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
