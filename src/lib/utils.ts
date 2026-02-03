import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "BRL",
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(
  date: string | Date,
  format: "short" | "long" = "short",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("pt-BR").format(dateObj);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(dateObj);
}

/**
 * Formata uma data string (YYYY-MM-DD) sem problemas de timezone
 * Usa parseISO do date-fns que trata corretamente datas sem hora
 */
export function formatDateSafe(
  dateString: string,
  formatString: string = "dd/MM/yyyy",
): string {
  // Se a string já tem hora, use Date normal
  if (dateString.includes("T")) {
    return formatString;
  }

  // Para datas no formato YYYY-MM-DD, parse manualmente para evitar timezone
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Formata manualmente para evitar dependência do date-fns
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();

  // Suporta apenas dd/MM/yyyy por enquanto
  if (formatString === "dd/MM/yyyy") {
    return `${d}/${m}/${y}`;
  }

  // Fallback para formato padrão
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/**
 * Converte uma string de data (YYYY-MM-DD) para objeto Date sem problemas de timezone
 * Útil para popular formulários com datas vindas do banco
 */
export function parseDateSafe(dateString: string): Date {
  // Se a string já tem hora, use Date normal
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  // Para datas no formato YYYY-MM-DD, parse manualmente para evitar timezone
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function daysUntil(date: string | Date): number {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
