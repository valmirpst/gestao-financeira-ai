import { supabase } from "@/lib/supabase";
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
  CategoryWithParent,
} from "@/types/database.types";

/**
 * Busca todas as categorias do usuário com hierarquia pai/filho
 */
export async function getCategories(): Promise<CategoryWithParent[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        parent_category:categories(*)
      `,
      )
      .order("name");

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("getCategories error:", error);
    throw error;
  }
}

/**
 * Busca uma categoria por ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar categoria: ${error.message}`);
    }

    if (!data) {
      throw new Error("Categoria não encontrada");
    }

    return data;
  } catch (error) {
    console.error("getCategoryById error:", error);
    throw error;
  }
}

/**
 * Cria uma nova categoria
 */
export async function createCategory(data: CategoryInsert): Promise<Category> {
  try {
    // Validações
    if (!data.name || !data.type || !data.color || !data.icon) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    if (data.name.length < 2 || data.name.length > 50) {
      throw new Error("Nome deve ter entre 2 e 50 caracteres");
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new Error("Cor deve estar no formato hexadecimal (#RRGGBB)");
    }

    // Validar se categoria pai existe e é do mesmo tipo
    if (data.parent_category_id) {
      const parentCategory = await getCategoryById(data.parent_category_id);

      if (parentCategory.type !== data.type && parentCategory.type !== "both") {
        throw new Error('Categoria pai deve ser do mesmo tipo ou tipo "both"');
      }
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert(data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma categoria com este nome");
      }
      throw new Error(`Erro ao criar categoria: ${error.message}`);
    }

    if (!category) {
      throw new Error("Erro ao criar categoria");
    }

    return category;
  } catch (error) {
    console.error("createCategory error:", error);
    throw error;
  }
}

/**
 * Atualiza uma categoria
 */
export async function updateCategory(
  id: string,
  updates: CategoryUpdate,
): Promise<Category> {
  try {
    // Validações
    if (
      updates.name !== undefined &&
      (updates.name.length < 2 || updates.name.length > 50)
    ) {
      throw new Error("Nome deve ter entre 2 e 50 caracteres");
    }

    if (
      updates.color !== undefined &&
      !/^#[0-9A-Fa-f]{6}$/.test(updates.color)
    ) {
      throw new Error("Cor deve estar no formato hexadecimal (#RRGGBB)");
    }

    // Validar se não está criando loop (categoria filha sendo pai de sua própria categoria pai)
    if (updates.parent_category_id) {
      if (updates.parent_category_id === id) {
        throw new Error("Uma categoria não pode ser pai de si mesma");
      }

      const parentCategory = await getCategoryById(updates.parent_category_id);

      if (parentCategory.parent_category_id === id) {
        throw new Error(
          "Não é possível criar loops na hierarquia de categorias",
        );
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma categoria com este nome");
      }
      throw new Error(`Erro ao atualizar categoria: ${error.message}`);
    }

    if (!data) {
      throw new Error("Categoria não encontrada");
    }

    return data;
  } catch (error) {
    console.error("updateCategory error:", error);
    throw error;
  }
}

/**
 * Deleta uma categoria
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      throw new Error(`Erro ao deletar categoria: ${error.message}`);
    }
  } catch (error) {
    console.error("deleteCategory error:", error);
    throw error;
  }
}

/**
 * Cria categorias padrão do sistema
 */
export async function createDefaultCategories(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Categorias de despesas
    const expenseCategories = [
      { name: "Alimentação", icon: "utensils", color: "#ef4444" },
      { name: "Transporte", icon: "car", color: "#3b82f6" },
      { name: "Moradia", icon: "home", color: "#8b5cf6" },
      { name: "Saúde", icon: "heart", color: "#ec4899" },
      { name: "Educação", icon: "book", color: "#06b6d4" },
      { name: "Lazer", icon: "smile", color: "#f59e0b" },
      { name: "Vestuário", icon: "shirt", color: "#10b981" },
      { name: "Contas Fixas", icon: "file-text", color: "#6366f1" },
      { name: "Outros", icon: "more-horizontal", color: "#64748b" },
    ];

    // Categorias de receitas
    const incomeCategories = [
      { name: "Salário", icon: "briefcase", color: "#22c55e" },
      { name: "Investimentos", icon: "trending-up", color: "#14b8a6" },
      { name: "Freelance", icon: "laptop", color: "#a855f7" },
      { name: "Outros", icon: "more-horizontal", color: "#64748b" },
    ];

    // Inserir categorias de despesas
    for (const category of expenseCategories) {
      await createCategory({
        user_id: user.id,
        name: category.name,
        type: "expense",
        color: category.color,
        icon: category.icon,
        parent_category_id: null,
      });
    }

    // Inserir categorias de receitas
    for (const category of incomeCategories) {
      await createCategory({
        user_id: user.id,
        name: category.name,
        type: "income",
        color: category.color,
        icon: category.icon,
        parent_category_id: null,
      });
    }
  } catch (error) {
    console.error("createDefaultCategories error:", error);
    throw error;
  }
}
