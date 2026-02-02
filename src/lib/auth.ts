import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface AuthError {
  message: string;
}

/**
 * Translate Supabase auth error messages to Portuguese
 */
function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos",
    "Email not confirmed":
      "Email não confirmado. Verifique sua caixa de entrada",
    "User already registered": "Este email já está cadastrado",
    "Password should be at least 6 characters":
      "A senha deve ter no mínimo 6 caracteres",
    "Unable to validate email address: invalid format":
      "Formato de email inválido",
    "Signup requires a valid password":
      "É necessário fornecer uma senha válida",
    "User not found": "Usuário não encontrado",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos",
    "Invalid email or password": "Email ou senha incorretos",
  };

  // Check for exact match
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Return original message if no translation found
  return errorMessage;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: translateAuthError(error.message) },
      };
    }

    return { user: data.user, error: null };
  } catch (error) {
    return {
      user: null,
      error: { message: "Erro ao criar conta. Tente novamente." },
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  email: string,
  password: string,
): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: translateAuthError(error.message) },
      };
    }

    return { user: data.user, error: null };
  } catch (error) {
    return {
      user: null,
      error: { message: "Erro ao fazer login. Tente novamente." },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: translateAuthError(error.message) } };
    }

    return { error: null };
  } catch (error) {
    return { error: { message: "Erro ao sair. Tente novamente." } };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{
  error: AuthError | null;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: { message: translateAuthError(error.message) } };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message: "Erro ao enviar email de recuperação. Tente novamente.",
      },
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{
  error: AuthError | null;
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: { message: translateAuthError(error.message) } };
    }

    return { error: null };
  } catch (error) {
    return {
      error: { message: "Erro ao atualizar senha. Tente novamente." },
    };
  }
}
