import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBudget, useUpdateBudget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { cn, parseDateSafe } from "@/lib/utils";
import type { BudgetPeriod, BudgetWithUsage } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const budgetSchema = z.object({
  category_id: z.string().optional(),
  amount: z.coerce
    .number({
      required_error: "Valor é obrigatório",
      invalid_type_error: "Valor deve ser um número",
    })
    .positive("Valor deve ser maior que zero"),
  period: z.enum(["monthly", "weekly", "yearly", "custom"], {
    required_error: "Período é obrigatório",
  }),
  start_date: z.date({
    required_error: "Data de início é obrigatória",
  }),
  end_date: z.date().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetWithUsage | null;
}

export function BudgetDialog({
  open,
  onOpenChange,
  budget,
}: BudgetDialogProps) {
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const isEditing = !!budget;

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: undefined,
      amount: 0,
      period: "monthly",
      start_date: new Date(),
      end_date: undefined,
    },
  });

  // Reset form when dialog opens/closes or budget changes
  useEffect(() => {
    if (open && budget) {
      form.reset({
        category_id: budget.category_id || undefined,
        amount: budget.amount,
        period: budget.period,
        start_date: parseDateSafe(budget.start_date),
        end_date: budget.end_date ? parseDateSafe(budget.end_date) : undefined,
      });
    } else if (open && !budget) {
      form.reset({
        category_id: undefined,
        amount: 0,
        period: "monthly",
        start_date: new Date(),
        end_date: undefined,
      });
    }
  }, [open, budget, form]);

  const onSubmit = async (values: BudgetFormValues) => {
    try {
      const data = {
        category_id:
          values.category_id && values.category_id !== "__none__"
            ? values.category_id
            : null,
        amount: values.amount,
        period: values.period as BudgetPeriod,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: values.end_date
          ? format(values.end_date, "yyyy-MM-dd")
          : null,
      };

      if (isEditing) {
        await updateBudget.mutateAsync({
          id: budget.id,
          data,
        });
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await createBudget.mutateAsync(data);
        toast.success("Orçamento criado com sucesso!");
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar orçamento" : "Erro ao criar orçamento",
      );
    }
  };

  const periodValue = form.watch("period");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do orçamento"
              : "Defina um limite de gastos para controlar suas despesas"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "__none__" ? undefined : value);
                    }}
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Geral (todas as categorias)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">
                        Geral (todas as categorias)
                      </SelectItem>
                      {categories
                        .filter(
                          (cat) =>
                            cat.type === "expense" || cat.type === "both",
                        )
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Deixe em branco para orçamento geral
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Orçamento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date (only for custom period) */}
            {periodValue === "custom" && (
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Final (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBudget.isPending || updateBudget.isPending}
              >
                {createBudget.isPending || updateBudget.isPending
                  ? "Salvando..."
                  : isEditing
                    ? "Atualizar"
                    : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
