import { supabase } from "@/lib/supabase";
import type {
  Budget,
  BudgetInsert,
  BudgetUpdate,
  BudgetWithUsage,
} from "@/types/database.types";
import { differenceInDays } from "date-fns";

/**
 * Calculate budget usage based on paid transactions
 */
export async function getBudgetUsage(budgetId: string): Promise<{
  spent: number;
  percentage: number;
  days_remaining: number;
}> {
  try {
    // Get budget details
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", budgetId)
      .single();

    if (budgetError || !budget) {
      throw new Error("Budget not found");
    }

    // Calculate date range based on period
    let startDate: string;
    let endDate: string;

    const today = new Date();
    const budgetStartDate = new Date(budget.start_date);

    switch (budget.period) {
      case "monthly":
        // Use the budget's start date as reference
        startDate = budget.start_date;
        // Calculate end date as 1 month from start date
        const monthEnd = new Date(budgetStartDate);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(monthEnd.getDate() - 1); // Last day of the month period
        endDate = monthEnd.toISOString().split("T")[0];
        break;
      case "weekly":
        // Use the budget's start date as reference
        startDate = budget.start_date;
        // Calculate end date as 7 days from start date
        const weekEnd = new Date(budgetStartDate);
        weekEnd.setDate(weekEnd.getDate() + 6); // 7 days total (0-6)
        endDate = weekEnd.toISOString().split("T")[0];
        break;
      case "yearly":
        // Use the budget's start date as reference
        startDate = budget.start_date;
        // Calculate end date as 1 year from start date
        const yearEnd = new Date(budgetStartDate);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);
        yearEnd.setDate(yearEnd.getDate() - 1); // Last day of the year period
        endDate = yearEnd.toISOString().split("T")[0];
        break;
      case "custom":
        startDate = budget.start_date;
        endDate = budget.end_date || today.toISOString().split("T")[0];
        break;
      default:
        startDate = budget.start_date;
        endDate = budget.end_date || today.toISOString().split("T")[0];
    }

    // Build query for transactions
    let query = supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", budget.user_id)
      .eq("type", "expense")
      .eq("status", "paid")
      .gte("date", startDate)
      .lte("date", endDate);

    // Filter by category if specified
    if (budget.category_id) {
      query = query.eq("category_id", budget.category_id);
    }

    const { data: transactions, error: transactionsError } = await query;

    if (transactionsError) {
      throw transactionsError;
    }

    // Calculate spent amount
    const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Calculate percentage
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    // Calculate days remaining
    const daysRemaining = differenceInDays(new Date(endDate), today);

    return {
      spent,
      percentage,
      days_remaining: Math.max(0, daysRemaining),
    };
  } catch (error) {
    console.error("Error calculating budget usage:", error);
    throw error;
  }
}

/**
 * Get all budgets with usage calculation
 */
export async function getBudgets(): Promise<BudgetWithUsage[]> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Fetch budgets with category relation
    const { data: budgets, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!budgets) {
      return [];
    }

    // Calculate usage for each budget
    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const usage = await getBudgetUsage(budget.id);
        return {
          ...budget,
          spent: usage.spent,
          percentage: usage.percentage,
          days_remaining: usage.days_remaining,
        };
      }),
    );

    return budgetsWithUsage;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
}

/**
 * Get budget by ID with usage calculation
 */
export async function getBudgetById(id: string): Promise<BudgetWithUsage> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Fetch budget with category relation
    const { data: budget, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Calculate usage
    const usage = await getBudgetUsage(budget.id);

    return {
      ...budget,
      spent: usage.spent,
      percentage: usage.percentage,
      days_remaining: usage.days_remaining,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

/**
 * Create a new budget
 */
export async function createBudget(data: BudgetInsert): Promise<Budget> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Insert budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!budget) {
      throw new Error("Failed to create budget");
    }

    return budget;
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error;
  }
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  data: BudgetUpdate,
): Promise<Budget> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!budget) {
      throw new Error("Budget not found or update failed");
    }

    return budget;
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Delete budget
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error;
  }
}
