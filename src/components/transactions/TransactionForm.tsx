import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useActiveAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import type { TransactionInsert } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "../ui/checkbox";

// Schema de validação conforme PRD
const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"], {
      required_error: "Tipo é obrigatório",
    }),
    amount: z
      .number({
        required_error: "Valor é obrigatório",
        invalid_type_error: "Valor deve ser um número",
      })
      .positive("Valor deve ser maior que zero"),
    description: z
      .string({
        required_error: "Descrição é obrigatória",
      })
      .min(3, "Descrição deve ter no mínimo 3 caracteres")
      .max(200, "Descrição deve ter no máximo 200 caracteres"),
    category_id: z.string().optional(),
    account_id: z.string({
      required_error: "Conta é obrigatória",
    }),
    status: z.enum(["paid", "pending"], {
      required_error: "Status é obrigatório",
    }),
    payment_date: z.date().optional(),
    due_date: z.date().optional(),
    tags: z.array(z.string()).default([]),
    is_recurring: z.boolean().default(false),
    recurrence_frequency: z
      .enum(["daily", "weekly", "monthly", "yearly"])
      .optional(),
    recurrence_interval: z.number().positive().optional(),
    recurrence_end_date: z.date().optional(),
  })
  .refine(
    (data) => {
      // Se status = 'paid', payment_date é obrigatório
      if (data.status === "paid") {
        return !!data.payment_date;
      }
      return true;
    },
    {
      message: "Data de pagamento é obrigatória para transações pagas",
      path: ["payment_date"],
    },
  )
  .refine(
    (data) => {
      // Se status = 'pending', due_date é obrigatório
      if (data.status === "pending") {
        return !!data.due_date;
      }
      return true;
    },
    {
      message: "Data de vencimento é obrigatória para transações pendentes",
      path: ["due_date"],
    },
  )
  .refine(
    (data) => {
      // payment_date não pode ser futura (mais de 1 dia no futuro)
      if (data.payment_date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return data.payment_date <= tomorrow;
      }
      return true;
    },
    {
      message: "Data de pagamento não pode ser futura",
      path: ["payment_date"],
    },
  )
  .refine(
    (data) => {
      // Se is_recurring = true, recurrence_config é obrigatório
      if (data.is_recurring) {
        return !!data.recurrence_frequency && !!data.recurrence_interval;
      }
      return true;
    },
    {
      message: "Configuração de recorrência é obrigatória",
      path: ["recurrence_frequency"],
    },
  );

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionInsert) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  defaultValues?: Partial<TransactionFormValues>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function TransactionForm({
  onSubmit,
  onCancel,
  onDelete,
  defaultValues,
  isLoading,
  isEditing,
}: TransactionFormProps) {
  const [tagInput, setTagInput] = useState("");

  // Fetch data
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useActiveAccounts();

  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      status: "paid",
      payment_date: new Date(),
      tags: [],
      is_recurring: false,
      recurrence_interval: 1,
      ...defaultValues,
    },
  });

  const watchType = form.watch("type");
  const watchStatus = form.watch("status");
  const watchTags = form.watch("tags");
  const watchIsRecurring = form.watch("is_recurring");

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) => cat.type === watchType || cat.type === "both",
    );
  }, [categories, watchType]);

  // Handle form submission
  const handleSubmit = (values: TransactionFormValues) => {
    const {
      payment_date,
      due_date,
      is_recurring,
      recurrence_frequency,
      recurrence_interval,
      recurrence_end_date,
      ...rest
    } = values;

    const data: Omit<TransactionInsert, "user_id"> = {
      ...rest,
      date: payment_date
        ? format(payment_date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      payment_date: payment_date ? format(payment_date, "yyyy-MM-dd") : null,
      due_date: due_date ? format(due_date, "yyyy-MM-dd") : null,
      is_recurring,
      recurrence_config:
        is_recurring && recurrence_frequency && recurrence_interval
          ? {
              frequency: recurrence_frequency,
              interval: recurrence_interval,
              end_date: recurrence_end_date
                ? format(recurrence_end_date, "yyyy-MM-dd")
                : null,
            }
          : null,
      transfer_id: null,
      category_id: rest.category_id || null,
    };

    onSubmit(data as TransactionInsert);
  };

  // Handle tag input
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !watchTags.includes(trimmedTag)) {
      form.setValue("tags", [...watchTags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      watchTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Tipo */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === "income" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      field.value === "income" &&
                        "bg-green-600 hover:bg-green-700",
                    )}
                    onClick={() => field.onChange("income")}
                  >
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "expense" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      field.value === "expense" &&
                        "bg-red-600 hover:bg-red-700",
                    )}
                    onClick={() => field.onChange("expense")}
                  >
                    Saída
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === "paid" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      field.onChange("paid");
                      form.setValue("payment_date", new Date());
                      form.setValue("due_date", undefined);
                    }}
                  >
                    Pago
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "pending" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      field.onChange("pending");
                      form.setValue("payment_date", undefined);
                    }}
                  >
                    Pendente
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Compra no supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((category) => (
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conta */}
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data de Pagamento (se status = paid) */}
        {watchStatus === "paid" && (
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Pagamento *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
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
                      disabled={(date) => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(23, 59, 59, 999);
                        return date > tomorrow;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Data de Vencimento (se status = pending) */}
        {watchStatus === "pending" && (
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Vencimento *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
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

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags (opcional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma tag e pressione Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Adicionar
                    </Button>
                  </div>
                  {watchTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transação Recorrente */}
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Transação Recorrente</FormLabel>
                <FormDescription>
                  Marque se esta transação se repete periodicamente
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Campos de Recorrência (se marcado) */}
        {watchIsRecurring && (
          <div className="space-y-4 rounded-md border p-4 bg-muted/50">
            <h3 className="font-medium text-sm">Configuração de Recorrência</h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Frequência */}
              <FormField
                control={form.control}
                name="recurrence_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Intervalo */}
              <FormField
                control={form.control}
                name="recurrence_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repetir a cada *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {form.watch("recurrence_frequency") === "daily"
                            ? "dia(s)"
                            : form.watch("recurrence_frequency") === "weekly"
                              ? "semana(s)"
                              : form.watch("recurrence_frequency") === "monthly"
                                ? "mês(es)"
                                : form.watch("recurrence_frequency") ===
                                    "yearly"
                                  ? "ano(s)"
                                  : "período(s)"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data Final */}
            <FormField
              control={form.control}
              name="recurrence_end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Final (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Sem data final</span>
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
                  <FormDescription>
                    Deixe em branco para recorrência sem fim
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}

          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
