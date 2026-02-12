import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import type { CategoryInsert } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Preset de cores
const PRESET_COLORS = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f97316" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#22c55e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
];

// Ícones disponíveis (usando nomes do lucide-react)
const AVAILABLE_ICONS = [
  "shopping-cart",
  "home",
  "car",
  "utensils",
  "heart",
  "briefcase",
  "gift",
  "plane",
  "book",
  "music",
  "film",
  "smartphone",
  "laptop",
  "coffee",
  "pizza",
  "shirt",
  "dumbbell",
  "stethoscope",
  "graduation-cap",
  "wallet",
];

// Schema de validação
const categorySchema = z.object({
  name: z
    .string({
      required_error: "Nome é obrigatório",
    })
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  type: z.enum(["income", "expense", "both"], {
    required_error: "Tipo é obrigatório",
  }),
  color: z.string({
    required_error: "Cor é obrigatória",
  }),
  icon: z.string({
    required_error: "Ícone é obrigatório",
  }),
  parent_category_id: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryInsert) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  defaultValues?: Partial<CategoryFormValues>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function CategoryForm({
  onSubmit,
  onCancel,
  onDelete,
  defaultValues,
  isLoading,
  isEditing,
}: CategoryFormProps) {
  // Fetch categories for parent selection
  const { data: categories = [] } = useCategories();

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: "expense",
      color: PRESET_COLORS[0].value,
      icon: AVAILABLE_ICONS[0],
      ...defaultValues,
    },
  });

  const watchType = form.watch("type");
  const watchColor = form.watch("color");

  // Filter parent categories by type
  const parentCategories = categories.filter((cat) => {
    // Can't be parent of itself
    if (isEditing && defaultValues?.name === cat.name) return false;
    // Parent must be same type or "both"
    return cat.type === watchType || cat.type === "both";
  });

  // Handle form submission
  const handleSubmit = (values: CategoryFormValues) => {
    const data: Omit<CategoryInsert, "user_id"> = {
      ...values,
      parent_category_id: values.parent_category_id || null,
    };

    onSubmit(data as CategoryInsert);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Saída</SelectItem>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Define se a categoria é para receitas, despesas ou ambos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cor */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor *</FormLabel>
              <FormControl>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => field.onChange(color.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border-2 p-2 transition-all hover:scale-105",
                        field.value === color.value
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-transparent",
                      )}
                    >
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ícone */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: watchColor }}
                        />
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria Pai */}
        <FormField
          control={form.control}
          name="parent_category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria Pai (opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value || undefined)}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria principal)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Subcategorias herdam o tipo da categoria pai
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
              className="w-full sm:w-auto sm:mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
