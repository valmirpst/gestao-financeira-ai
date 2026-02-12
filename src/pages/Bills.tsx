import { MarkAsPaidDialog } from "@/components/bills/MarkAsPaidDialog";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/ui/empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from "@/hooks/useTransactions";
import { cn, formatCurrency, formatDateSafe, parseDateSafe } from "@/lib/utils";
import type { TransactionStatus } from "@/types";
import type {
  TransactionType,
  TransactionWithRelations,
} from "@/types/database.types";
import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  isPast,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Receipt,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "overdue";
type PeriodFilter = "this_month" | "30days" | "overdue" | "custom";

const statusLabels: Record<TransactionStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusVariants: Record<
  TransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

export default function Bills() {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Get initial tab from URL search params
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TransactionType>(
    initialTab === "income" ? "income" : "expense",
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("this_month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<TransactionWithRelations | null>(null);

  // Fetch data
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  // Mutations
  const deleteMutation = useDeleteTransaction();
  const createMutation = useCreateTransaction();

  // Calculate date range based on period filter
  const dateRange = useMemo(() => {
    const today = new Date();
    switch (periodFilter) {
      case "this_month":
        return {
          from: format(startOfMonth(today), "yyyy-MM-dd"),
          to: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      case "30days":
        return {
          from: format(today, "yyyy-MM-dd"),
          to: format(addDays(today, 30), "yyyy-MM-dd"),
        };
      case "overdue":
        return {
          from: format(startOfMonth(addDays(today, -365)), "yyyy-MM-dd"),
          to: format(addDays(today, -1), "yyyy-MM-dd"),
        };
      case "custom":
        return customDateRange.from && customDateRange.to
          ? {
              from: format(customDateRange.from, "yyyy-MM-dd"),
              to: format(customDateRange.to, "yyyy-MM-dd"),
            }
          : undefined;
      default:
        return undefined;
    }
  }, [periodFilter, customDateRange]);

  // Fetch transactions
  const { data: allTransactions = [] } = useTransactions({
    type: activeTab,
    start_date: dateRange?.from,
    end_date: dateRange?.to,
    category_id: categoryFilter !== "all" ? categoryFilter : undefined,
    account_id: accountFilter !== "all" ? accountFilter : undefined,
  });

  // Filter transactions by status
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions.filter((t) => {
      // Only show pending and overdue
      if (t.status === "paid" || t.status === "cancelled") return false;
      return true;
    });

    // Apply status filter
    if (statusFilter === "pending") {
      filtered = filtered.filter(
        (t) =>
          t.status === "pending" &&
          t.due_date &&
          !isPast(parseDateSafe(t.due_date)),
      );
    } else if (statusFilter === "overdue") {
      filtered = filtered.filter(
        (t) =>
          t.status === "overdue" ||
          (t.due_date && isPast(parseDateSafe(t.due_date))),
      );
    }

    // Sort by due date
    return filtered.sort((a, b) => {
      const dateA = a.due_date ? parseDateSafe(a.due_date).getTime() : 0;
      const dateB = b.due_date ? parseDateSafe(b.due_date).getTime() : 0;
      return dateA - dateB;
    });
  }, [allTransactions, statusFilter]);

  // Calculate summary
  const summary = useMemo(() => {
    const expenseTransactions = allTransactions.filter(
      (t) => t.type === "expense",
    );
    const incomeTransactions = allTransactions.filter(
      (t) => t.type === "income",
    );

    const totalToPay = expenseTransactions
      .filter((t) => t.status === "pending" || t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOverdueToPay = expenseTransactions
      .filter(
        (t) =>
          t.status === "overdue" ||
          (t.due_date && isPast(parseDateSafe(t.due_date))),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalToReceive = incomeTransactions
      .filter((t) => t.status === "pending" || t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOverdueToReceive = incomeTransactions
      .filter(
        (t) =>
          t.status === "overdue" ||
          (t.due_date && isPast(parseDateSafe(t.due_date))),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalToPay,
      totalOverdueToPay,
      totalToReceive,
      totalOverdueToReceive,
    };
  }, [allTransactions]);

  // Handle mark as paid
  const handleOpenMarkAsPaidDialog = (
    transaction: TransactionWithRelations,
  ) => {
    setSelectedTransaction(transaction);
    setMarkAsPaidDialogOpen(true);
  };

  const handleEdit = (transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDelete = (transaction: TransactionWithRelations) => {
    setTransactionToDelete(transaction);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteMutation.mutateAsync(transactionToDelete.id);
      toast.success("Transação deletada", {
        description: "A transação foi removida com sucesso.",
        action: {
          label: "Desfazer",
          onClick: () => {
            const { id, created_at, updated_at, ...transactionData } =
              transactionToDelete;
            createMutation.mutate(transactionData);
          },
        },
      });
    } catch (error) {
      toast.error("Erro ao remover", {
        description: "Não foi possível remover a transação. Tente novamente.",
      });
    } finally {
      setTransactionToDelete(null);
    }
  };

  const getAccountName = (transaction: TransactionWithRelations) => {
    if (!transaction.account) {
      return "Sem conta";
    }
    return transaction.account.name || "Sem conta";
  };

  // Get days remaining/overdue
  const getDaysInfo = (dueDate: string | null) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = parseDateSafe(dueDate);
    const days = differenceInDays(due, today);

    if (days < 0) {
      return {
        text: `${Math.abs(days)} dias em atraso`,
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    } else if (days === 0) {
      return {
        text: "Vence hoje",
        variant: "default" as const,
        icon: Clock,
      };
    } else if (days <= 3) {
      return {
        text: `${days} dias`,
        variant: "default" as const,
        icon: Clock,
      };
    } else {
      return {
        text: `${days} dias`,
        variant: "secondary" as const,
        icon: Clock,
      };
    }
  };

  const AccountFilter = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Conta</label>
      <Select value={accountFilter} onValueChange={setAccountFilter}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Contas a Pagar/Receber
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas contas pendentes e vencidas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalToPay)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vencido a Pagar
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalOverdueToPay)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalToReceive)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vencido a Receber
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalOverdueToReceive)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TransactionType)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense">A Pagar</TabsTrigger>
          <TabsTrigger value="income">A Receber</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isMobile && <AccountFilter />}

          {/* Filters */}
          <Collapsible defaultOpen={!isMobile}>
            {isMobile && (
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4" />
                  Expandir Filtros
                </Button>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <Card>
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="overdue">Vencidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Period Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <Select
                      value={periodFilter}
                      onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this_month">Este mês</SelectItem>
                        <SelectItem value="30days">Próximos 30 dias</SelectItem>
                        <SelectItem value="overdue">Vencidas</SelectItem>
                        <SelectItem value="custom">Customizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories
                          .filter(
                            (cat) =>
                              cat.type === activeTab || cat.type === "both",
                          )
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!isMobile && <AccountFilter />}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Custom Date Range */}
          {periodFilter === "custom" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDateRange.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateRange.from ? (
                            format(customDateRange.from, "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateRange.from}
                          onSelect={(date) =>
                            setCustomDateRange((prev) => ({
                              ...prev,
                              from: date,
                            }))
                          }
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Data Final</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDateRange.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateRange.to ? (
                            format(customDateRange.to, "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateRange.to}
                          onSelect={(date) =>
                            setCustomDateRange((prev) => ({
                              ...prev,
                              to: date,
                            }))
                          }
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table / Cards */}
          <div className="space-y-4">
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="pt-6">
                {filteredTransactions.length === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="Nenhuma conta encontrada"
                    description="Não encontramos nenhuma conta com os filtros selecionados."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const daysInfo = getDaysInfo(transaction.due_date);
                        const DaysIcon = daysInfo?.icon;

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              {transaction.category && (
                                <Badge
                                  variant="outline"
                                  style={{
                                    borderColor: transaction.category.color,
                                    color: transaction.category.color,
                                  }}
                                >
                                  {transaction.category.name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {transaction.account?.name || "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {transaction.due_date
                                ? formatDateSafe(transaction.due_date)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {daysInfo && (
                                <Badge variant={daysInfo.variant}>
                                  {DaysIcon && (
                                    <DaysIcon className="h-3 w-3 mr-1" />
                                  )}
                                  {daysInfo.text}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "overdue" ||
                                  (transaction.due_date &&
                                    isPast(parseDateSafe(transaction.due_date)))
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {transaction.status === "overdue" ||
                                (transaction.due_date &&
                                  isPast(parseDateSafe(transaction.due_date)))
                                  ? "Vencida"
                                  : "Pendente"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenMarkAsPaidDialog(
                                      transaction as TransactionWithRelations,
                                    )
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredTransactions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <EmptyState
                      icon={Receipt}
                      title="Nenhuma conta encontrada"
                      description="Não encontramos nenhuma conta com os filtros selecionados."
                    />
                  </CardContent>
                </Card>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction as TransactionWithRelations}
                    statusLabels={statusLabels}
                    statusVariants={statusVariants}
                    getAccountName={getAccountName}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkAsPaid={handleOpenMarkAsPaidDialog}
                    isDeleting={deleteMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mark as Paid Dialog */}
      <MarkAsPaidDialog
        transaction={selectedTransaction}
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
      />

      {/* Edit Transaction Dialog */}
      <TransactionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={
          selectedTransaction as TransactionWithRelations | undefined
        }
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              transação e removerá os dados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
