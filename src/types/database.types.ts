/**
 * Database Types
 * Tipos TypeScript baseados no schema SQL do Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================
// ENUMS
// =====================================================

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled";
export type CategoryType = "income" | "expense" | "both";
export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "investment"
  | "other";
export type BudgetPeriod = "monthly" | "yearly";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

// =====================================================
// RECURRENCE CONFIG
// =====================================================

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number;
  end_date: string | null;
}

// =====================================================
// DATABASE TABLES
// =====================================================

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parent_category_id: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  description: string;
  date: string;
  due_date: string | null;
  status: TransactionStatus;
  is_recurring: boolean;
  recurrence_config: RecurrenceConfig | null;
  tags: string[];
  payment_date: string | null;
  transfer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountTransaction {
  id: string;
  transaction_id: string;
  account_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INSERT TYPES (para criar novos registros)
// =====================================================

export type CategoryInsert = Omit<Category, "id" | "created_at">;
export type AccountInsert = Omit<
  Account,
  "id" | "current_balance" | "created_at" | "updated_at"
>;
export type TransactionInsert = Omit<
  Transaction,
  "id" | "created_at" | "updated_at"
>;
export type AccountTransactionInsert = Omit<
  AccountTransaction,
  "id" | "created_at"
>;
export type BudgetInsert = Omit<
  Budget,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// =====================================================
// UPDATE TYPES (para atualizar registros)
// =====================================================

export type CategoryUpdate = Partial<
  Omit<Category, "id" | "user_id" | "created_at">
>;
export type AccountUpdate = Partial<
  Omit<Account, "id" | "user_id" | "created_at">
>;
export type TransactionUpdate = Partial<
  Omit<Transaction, "id" | "user_id" | "created_at">
>;
export type BudgetUpdate = Partial<
  Omit<Budget, "id" | "user_id" | "created_at">
>;

// =====================================================
// EXTENDED TYPES (com relações)
// =====================================================

export interface TransactionWithRelations extends Transaction {
  category?: Category | null;
  account?: Account | null;
}

export interface CategoryWithParent extends Category {
  parent_category?: Category | null;
}

export interface BudgetWithCategory extends Budget {
  category?: Category | null;
}

// =====================================================
// COMPUTED TYPES (para cálculos)
// =====================================================

export interface AccountWithProjection extends Account {
  projected_balance: number;
}

export interface BudgetWithUsage extends Budget {
  spent: number;
  percentage: number;
  days_remaining: number;
  category?: Category | null;
}

// =====================================================
// DASHBOARD TYPES
// =====================================================

export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  previous_balance: number;
  variation_percentage: number;
}

export interface UpcomingBills {
  count: number;
  total: number;
  transactions: TransactionWithRelations[];
}

export interface OverdueBills {
  count: number;
  total: number;
  transactions: TransactionWithRelations[];
}

export interface CategoryExpense {
  category_id: string | null;
  category_name: string;
  category_color: string;
  total: number;
  percentage: number;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  category_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  search?: string;
}

export interface BillFilters {
  type?: TransactionType;
  status?: TransactionStatus | "all";
  category_id?: string;
  account_id?: string;
  due_date_start?: string;
  due_date_end?: string;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description: string;
  category_id?: string;
  account_id: string;
  status: "pending" | "paid";
  payment_date?: string;
  due_date?: string;
  tags?: string[];
  is_recurring?: boolean;
  recurrence_config?: RecurrenceConfig;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parent_category_id?: string;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  initial_balance: number;
  currency?: string;
  is_active?: boolean;
}

export interface BudgetFormData {
  category_id?: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date?: string;
}

export interface TransferFormData {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  description: string;
  status: "pending" | "paid";
  due_date?: string;
}

// =====================================================
// DATABASE SCHEMA TYPE
// =====================================================

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      accounts: {
        Row: Account;
        Insert: AccountInsert;
        Update: AccountUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      account_transactions: {
        Row: AccountTransaction;
        Insert: AccountTransactionInsert;
        Update: Partial<AccountTransactionInsert>;
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };
    };
  };
}
