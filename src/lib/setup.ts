import { supabase } from "./supabase";

/**
 * Create default categories for a new user
 */
export async function createDefaultCategories(userId: string): Promise<void> {
  const defaultCategories = [
    // Despesas
    {
      name: "Alimentação",
      type: "expense",
      color: "#ef4444",
      icon: "utensils",
    },
    { name: "Transporte", type: "expense", color: "#3b82f6", icon: "car" },
    { name: "Moradia", type: "expense", color: "#8b5cf6", icon: "home" },
    { name: "Saúde", type: "expense", color: "#10b981", icon: "heart" },
    { name: "Educação", type: "expense", color: "#f59e0b", icon: "book" },
    { name: "Lazer", type: "expense", color: "#ec4899", icon: "film" },
    { name: "Vestuário", type: "expense", color: "#6366f1", icon: "shirt" },
    {
      name: "Contas Fixas",
      type: "expense",
      color: "#64748b",
      icon: "file-text",
    },
    {
      name: "Outros",
      type: "expense",
      color: "#94a3b8",
      icon: "shopping-cart",
    },

    // Receitas
    {
      name: "Salário",
      type: "income",
      color: "#22c55e",
      icon: "dollar-sign",
    },
    {
      name: "Investimentos",
      type: "income",
      color: "#14b8a6",
      icon: "briefcase",
    },
    {
      name: "Freelance",
      type: "income",
      color: "#06b6d4",
      icon: "laptop",
    },
    { name: "Outros", type: "income", color: "#84cc16", icon: "gift" },

    // Transferência (ambos)
    {
      name: "Transferência",
      type: "both",
      color: "#6b7280",
      icon: "wallet",
    },
  ];

  try {
    const categoriesToInsert = defaultCategories.map((category) => ({
      ...category,
      user_id: userId,
      parent_category_id: null,
    }));

    const { error } = await supabase
      .from("categories")
      .insert(categoriesToInsert);

    if (error) {
      console.error("Error creating default categories:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to create default categories:", error);
    throw error;
  }
}
