import { createDefaultCategories as createDefaultCategoriesService } from "../services/categories.service";

/**
 * Create default categories for a new user
 * NOTE: This function delegates to the centralized implementation in categories.service.ts
 */
export async function createDefaultCategories(userId: string): Promise<void> {
  try {
    // Reutilizar a lógica centralizada no serviço
    await createDefaultCategoriesService(userId);
  } catch (error) {
    console.error("Failed to create default categories:", error);
    throw error;
  }
}
