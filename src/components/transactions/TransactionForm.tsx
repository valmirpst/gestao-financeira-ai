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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import type { TransactionInsert } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Repeat, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema de validação - Simplificado para usuários leigos
const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"], {
      required_error: "Selecione se é uma entrada ou saída",
    }),
    amount: z
      .number({
        required_error: "Informe o valor",
        invalid_type_error: "Digite um valor válido",
      })
      .positive("O valor deve ser maior que zero"),
    description: z
      .string({
        required_error: "Informe uma descrição",
      })
      .min(3, "A descrição deve ter pelo menos 3 caracteres")
      .max(200, "A descrição é muito longa (máximo 200 caracteres)"),
    category_id: z.string().optional(),
    account_id: z.string({
      required_error: "Selecione uma conta",
    }),
    status: z.enum(["paid", "pending"], {
      required_error: "Informe se foi pago ou está pendente",
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
      // Se status = 'paid' E não é recorrente, payment_date é obrigatório
      if (data.status === "paid" && !data.is_recurring) {
        return !!data.payment_date;
      }
      return true;
    },
    {
      message: "Informe quando foi pago",
      path: ["payment_date"],
    },
  )
  .refine(
    (data) => {
      // payment_date não pode ser futura APENAS para transações únicas já pagas
      // Para transações recorrentes, a data inicial pode ser futura
      if (data.payment_date && data.status === "paid" && !data.is_recurring) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return data.payment_date <= tomorrow;
      }
      return true;
    },
    {
      message: "A data de pagamento não pode ser no futuro",
      path: ["payment_date"],
    },
  )
  .refine(
    (data) => {
      // Para transações recorrentes, payment_date é obrigatório (é a data de início)
      if (data.is_recurring) {
        return !!data.payment_date;
      }
      return true;
    },
    {
      message: "Informe quando a recorrência começa",
      path: ["payment_date"],
    },
  )
  .refine(
    (data) => {
      // Se is_recurring = true, recurrence_frequency e interval são obrigatórios
      if (data.is_recurring) {
        return !!data.recurrence_frequency && !!data.recurrence_interval;
      }
      return true;
    },
    {
      message: "Configure a repetição",
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
  const [transactionMode, setTransactionMode] = useState<
    "single" | "recurring"
  >(defaultValues?.is_recurring ? "recurring" : "single");

  // Fetch data
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useActiveAccounts();

  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      status: "pending",
      tags: [],
      is_recurring: false,
      recurrence_interval: 1,
      recurrence_frequency: "monthly",
      ...defaultValues,
      // Garantir que transações pagas sempre tenham payment_date
      payment_date:
        defaultValues?.payment_date ||
        (defaultValues?.status === "paid" || !defaultValues?.status
          ? new Date()
          : undefined),
    },
  });

  const watchType = form.watch("type");
  const watchStatus = form.watch("status");
  const watchTags = form.watch("tags");

  // Atualizar is_recurring baseado no modo selecionado
  const handleModeChange = (mode: "single" | "recurring") => {
    setTransactionMode(mode);
    form.setValue("is_recurring", mode === "recurring");

    // Resetar campos de recorrência ao mudar para modo único
    if (mode === "single") {
      form.setValue("recurrence_frequency", undefined);
      form.setValue("recurrence_interval", 1);
      form.setValue("recurrence_end_date", undefined);
    } else {
      // Definir valores padrão ao ativar recorrência
      form.setValue("recurrence_frequency", "monthly");
      form.setValue("recurrence_interval", 1);
      // Garantir que há uma data de início
      if (!form.getValues("payment_date")) {
        form.setValue("payment_date", new Date());
      }
      // Se for pendente, manter due_date; se for pago, limpar
      if (form.getValues("status") === "paid") {
        form.setValue("due_date", undefined);
      }
    }
  };

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
      status,
      ...rest
    } = values;

    // Para transações recorrentes:
    // - 'date' é a data de início
    // - PAGAS: payment_date usa "Quando começa?" (é a data base de pagamento)
    // - PENDENTES: due_date é a data base de vencimento
    // Para transações únicas:
    // - Se 'paid': payment_date é obrigatório (não pode ser futura - constraint do BD)
    // - Se 'pending': due_date é obrigatório

    const data: Omit<TransactionInsert, "user_id"> = {
      ...rest,
      status,
      date: payment_date
        ? format(payment_date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      // payment_date: sempre enviado quando status = 'paid' (único ou recorrente)
      payment_date:
        status === "paid" && payment_date
          ? format(payment_date, "yyyy-MM-dd")
          : null,
      // due_date: sempre enviado quando status = 'pending' (único ou recorrente)
      due_date:
        status === "pending" && due_date
          ? format(due_date, "yyyy-MM-dd")
          : null,
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
        {/* Abas: Transação Única vs Recorrente */}
        <Tabs
          value={transactionMode}
          onValueChange={(v) => handleModeChange(v as "single" | "recurring")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Transação Única</TabsTrigger>
            <TabsTrigger value="recurring">
              <Repeat className="mr-2 h-4 w-4" />
              Transação Recorrente
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo compartilhado entre os dois modos */}
          <div className="mt-6 space-y-6">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>É uma entrada ou saída?</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={
                          field.value === "income" ? "default" : "outline"
                        }
                        className={cn(
                          "h-10",
                          field.value === "income" &&
                            "bg-green-600 hover:bg-green-700 text-white",
                        )}
                        onClick={() => field.onChange("income")}
                      >
                        <div className="font-semibold text-center">Entrada</div>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "expense" ? "default" : "outline"
                        }
                        className={cn(
                          "h-10",
                          field.value === "expense" &&
                            "bg-red-600 hover:bg-red-700 text-white",
                        )}
                        onClick={() => field.onChange("expense")}
                      >
                        <div className="font-semibold text-center">Saída</div>
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
                  <FormLabel>Qual foi o valor?</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-10 text-lg"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Digite apenas números. Ex: 150.50
                  </FormDescription>
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
                  <FormLabel>O que foi?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Compra no supermercado, Salário, Conta de luz..."
                      {...field}
                    />
                  </FormControl>
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
                  <FormLabel>Em qual conta?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhuma conta disponível
                        </SelectItem>
                      ) : (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Onde o dinheiro entrou ou saiu
                  </FormDescription>
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
                  <FormLabel>Categoria (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhuma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhuma categoria disponível
                        </SelectItem>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Para organizar seus gastos e receitas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Conteúdo específico de cada modo */}
          <TabsContent value="single" className="mt-6">
            <div className="space-y-6">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Já foi pago ou ainda vai pagar?</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={
                            field.value === "paid" ? "default" : "outline"
                          }
                          className="h-16"
                          onClick={() => {
                            field.onChange("paid");
                            form.setValue("payment_date", new Date());
                            form.setValue("due_date", undefined);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">Já foi pago</div>
                            <div className="text-xs opacity-80">
                              O dinheiro já saiu/entrou
                            </div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "pending" ? "default" : "outline"
                          }
                          className="h-16"
                          onClick={() => {
                            field.onChange("pending");
                            form.setValue("payment_date", undefined);
                            // Limpar due_date também para forçar usuário a selecionar uma data
                            form.setValue("due_date", undefined);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">
                              Ainda não foi pago
                            </div>
                            <div className="text-xs opacity-80">
                              Vai sair/entrar depois
                            </div>
                          </div>
                        </Button>
                      </div>
                    </FormControl>
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
                      <FormLabel>Quando foi pago?</FormLabel>
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
                                format(field.value, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
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
                              // Não permitir datas futuras (exceto hoje)
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              tomorrow.setHours(0, 0, 0, 0);
                              return date >= tomorrow;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs">
                        A data não pode ser no futuro
                      </FormDescription>
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
                      <FormLabel>Quando vence?</FormLabel>
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
                                format(field.value, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
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
                      <FormDescription className="text-xs">
                        Data em que a transação deve ser paga
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <div className="space-y-6">
              {/* Status - Simplificado para recorrentes */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>As transações começam como?</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={
                            field.value === "paid" ? "default" : "outline"
                          }
                          className="h-16"
                          onClick={() => {
                            field.onChange("paid");
                            // Recorrentes pagas não precisam de due_date
                            form.setValue("due_date", undefined);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">Já pagas</div>
                            <div className="text-xs opacity-80">
                              Ex: salário que já recebi
                            </div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "pending" ? "default" : "outline"
                          }
                          className="h-16"
                          onClick={() => {
                            field.onChange("pending");
                            // Recorrentes pendentes PRECISAM de due_date (data base de vencimento)
                            // Não limpamos aqui, usuário deve preencher
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">A pagar/receber</div>
                            <div className="text-xs opacity-80">
                              Ex: conta que vence
                            </div>
                          </div>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {watchStatus === "pending"
                        ? "Você precisará informar o dia de vencimento abaixo"
                        : "As transações serão criadas automaticamente como já pagas"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Frequência simplificada */}
              <FormField
                control={form.control}
                name="recurrence_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Com que frequência se repete?</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("recurrence_interval", 1);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Todo dia</SelectItem>
                        <SelectItem value="weekly">Toda semana</SelectItem>
                        <SelectItem value="monthly">Todo mês</SelectItem>
                        <SelectItem value="yearly">Todo ano</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Intervalo - Simplificado */}
              <FormField
                control={form.control}
                name="recurrence_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repetir a cada...</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          placeholder="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0 && value <= 12) {
                              field.onChange(value);
                            }
                          }}
                          className="w-24"
                        />
                        <span className="text-sm">
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
                    <FormDescription className="text-xs">
                      Ex: "2 meses" = a cada 2 meses | "1 mês" = todo mês
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primeira ocorrência */}
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quando começa?</FormLabel>
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
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
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
                    <FormDescription className="text-xs">
                      Data em que a primeira transação será criada. Pode ser
                      hoje ou no futuro.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data de Vencimento - Obrigatória para recorrentes pendentes */}
              {watchStatus === "pending" && (
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Qual o dia de vencimento?</FormLabel>
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
                                format(field.value, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
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
                      <FormDescription className="text-xs">
                        Data base que será usada para gerar os vencimentos. Ex:
                        Se escolher dia 5, todas as transações vencerão no dia 5
                        de cada mês.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Data Final - Opcional */}
              <FormField
                control={form.control}
                name="recurrence_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Até quando? (opcional)</FormLabel>
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
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Sem data final (repete para sempre)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3 border-b">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => field.onChange(undefined)}
                          >
                            Limpar data final
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          disabled={(date) => {
                            const startDate = form.watch("payment_date");
                            if (startDate) {
                              return date <= startDate;
                            }
                            return false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Deixe vazio se não souber quando vai terminar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Tags - Opcional e menos prominente */}
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer font-medium text-sm">
            Tags (opcional) - Clique para adicionar
          </summary>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite uma palavra-chave"
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
                  <FormDescription className="text-xs">
                    Tags ajudam você a encontrar e filtrar transações depois
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </details>

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
            size="lg"
          >
            {isLoading
              ? "Salvando..."
              : isEditing
                ? "Salvar Alterações"
                : "Criar Transação"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              size="lg"
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
              size="lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
