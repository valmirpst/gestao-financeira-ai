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
    // Buscar usuário autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

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
      .insert({
        ...data,
        user_id: user.id,
      })
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

    // @ts-ignore - Supabase type mismatch
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
      throw new Error(`Erro ao remover categoria: ${error.message}`);
    }
  } catch (error) {
    console.error("deleteCategory error:", error);
    throw error;
  }
}

/**
 * Cria categorias padrão do sistema
 */
export async function createDefaultCategories(userId?: string): Promise<void> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      targetUserId = user.id;
    }

    const defaultCategories = [
      // Despesas
      {
        name: "Alimentação",
        type: "expense",
        icon: "utensils",
        color: "#ef4444",
      },
      { name: "Transporte", type: "expense", icon: "car", color: "#3b82f6" },
      { name: "Saúde", type: "expense", icon: "heart", color: "#ec4899" },
      { name: "Educação", type: "expense", icon: "book", color: "#06b6d4" },
      { name: "Lazer", type: "expense", icon: "smile", color: "#f59e0b" },
      { name: "Vestuário", type: "expense", icon: "shirt", color: "#10b981" },
      {
        name: "Contas Fixas",
        type: "expense",
        icon: "file-text",
        color: "#6366f1",
      },
      {
        name: "Outros",
        type: "expense",
        icon: "more-horizontal",
        color: "#64748b",
      },

      // Receitas
      { name: "Salário", type: "income", icon: "briefcase", color: "#22c55e" },
      {
        name: "Investimentos",
        type: "income",
        icon: "trending-up",
        color: "#14b8a6",
      },
    ];

    // Preparar todas as categorias para serem processadas
    const categoriesToUpsert = defaultCategories.map((cat) => ({
      user_id: targetUserId,
      name: cat.name,
      type: cat.type as "expense" | "income" | "both",
      color: cat.color,
      icon: cat.icon,
      parent_category_id: null,
    }));

    // Usar upsert com ignoreDuplicates para evitar erros se a categoria já existir.
    // O Supabase usará a constraint 'unique_category_name_per_user' (definida no banco)
    // para identificar duplicatas e ignorá-las silenciosamente.
    const { error } = await supabase
      .from("categories")
      .upsert(categoriesToUpsert, {
        onConflict: "user_id, name",
        ignoreDuplicates: true,
      });

    if (error) {
      throw new Error(`Erro ao criar categorias padrão: ${error.message}`);
    }
  } catch (error) {
    console.error("createDefaultCategories error:", error);
    throw error;
  }
}
