export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled";
export type TransactionType = "income" | "expense";
export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "investment"
  | "other";
export type CategoryType = "income" | "expense" | "both";
export type BudgetPeriod = "monthly" | "yearly";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
