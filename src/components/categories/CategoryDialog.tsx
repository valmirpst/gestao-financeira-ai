import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import type { Category, CategoryInsert } from "@/types/database.types";
import { toast } from "sonner";
import { CategoryForm } from "./CategoryForm";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isEditing = !!category;

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleSubmit = async (data: CategoryInsert) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: category.id,
          updates: data,
        });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Categoria criada com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar categoria" : "Erro ao criar categoria",
      );
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("Categoria deletada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Convert category to form values if editing
  const defaultValues = category
    ? {
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        parent_category_id: category.parent_category_id || undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria abaixo."
              : "Preencha os dados para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={isEditing ? handleDelete : undefined}
          defaultValues={defaultValues}
          isLoading={
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending
          }
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
