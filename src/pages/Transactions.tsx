import { MarkAsPaidDialog } from "@/components/bills/MarkAsPaidDialog";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActiveAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteTransaction, useTransactions } from "@/hooks/useTransactions";
import { cn, formatCurrency, formatDateSafe } from "@/lib/utils";
import type { TransactionStatus, TransactionType } from "@/types";
import type {
  Transaction,
  TransactionWithRelations,
} from "@/types/database.types";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 50;

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

export default function Transactions() {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);

  // Filters state
  const [type, setType] = useState<TransactionType | "all">("all");
  const [status, setStatus] = useState<TransactionStatus | "all">("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction | null;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Mark as paid dialog state
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [transactionToMarkAsPaid, setTransactionToMarkAsPaid] =
    useState<Transaction | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useActiveAccounts();
  const { data: allTransactions = [], isLoading } = useTransactions({
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
    category_id: categoryId === "all" ? undefined : categoryId,
    account_id: accountId === "all" ? undefined : accountId,
    start_date: dateRange.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    search: search || undefined,
  });

  // Mutations
  const deleteMutation = useDeleteTransaction();

  // Filter transactions by search (client-side for description)
  // Filter and sort transactions (client-side)
  const filteredTransactions = useMemo(() => {
    return [...allTransactions].sort((a, b) => {
      const key = sortConfig.key || "date";
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [allTransactions, sortConfig]);

  // Calculate totals for the filtered period
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const paidExpense = filteredTransactions
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      paidExpense,
      balance: income - paidExpense,
    };
  }, [filteredTransactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [type, status, categoryId, accountId, search, dateRange]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta transação?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Transação deletada com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar transação");
    }
  };

  const handleOpenMarkAsPaidDialog = (transaction: Transaction) => {
    setTransactionToMarkAsPaid(transaction);
    setMarkAsPaidDialogOpen(true);
  };

  const clearFilters = () => {
    setType("all");
    setStatus("all");
    setCategoryId("all");
    setAccountId("all");
    setSearch("");
    setDateRange({ from: undefined, to: undefined });
  };

  const hasActiveFilters =
    type !== "all" ||
    status !== "all" ||
    categoryId !== "all" ||
    accountId !== "all" ||
    search !== "" ||
    dateRange.from !== undefined ||
    dateRange.to !== undefined;

  console.log(allTransactions);

  // Get account name from transaction
  const getAccountName = (transaction: TransactionWithRelations) => {
    if (!transaction.account) {
      return "Sem conta";
    }
    return transaction.account.name || "Sem conta";
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setSelectedTransaction(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total de Entradas
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(totals.income)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total de Saídas
          </p>
          <div className="flex items-baseline flex-col gap-1">
            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(totals.paidExpense)}
            </p>
            <p className="text-sm text-muted-foreground">
              A ser pago:{" "}
              <span className="text-red-600">
                {formatCurrency(totals.expense - totals.paidExpense)}
              </span>
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Saldo do Período
          </p>
          <div className="flex items-baseline flex-col gap-1">
            <p
              className={cn(
                "mt-2 text-2xl font-bold",
                totals.balance >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrency(totals.balance)}
            </p>
            <p className="text-sm text-muted-foreground">
              Considerando despesas a pagar:{" "}
              <span className="text-red-600">
                {formatCurrency(
                  totals.balance - (totals.expense - totals.paidExpense),
                )}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Entrada</SelectItem>
              <SelectItem value="expense">Saída</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Account Filter */}
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  "Período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) =>
                  setDateRange({ from: range?.from, to: range?.to })
                }
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="lg:col-span-1"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 p-0 hover:bg-transparent font-semibold w-full justify-center"
                >
                  Status
                  {sortConfig.key === "status" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="h-2 w-2" />
                    ) : (
                      <ArrowDown className="h-2 w-2" />
                    ))}
                </Button>
              </TableHead>
              <TableHead className="text-center wmin-w-max -20">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={cn(
                    transaction.status === "paid" &&
                      "opacity-60 hover:opacity-100 transition-opacity",
                  )}
                >
                  <TableCell>{formatDateSafe(transaction.date)}</TableCell>
                  <TableCell>
                    {transaction.due_date
                      ? formatDateSafe(transaction.due_date)
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: transaction.category.color + "20",
                          borderColor: transaction.category.color,
                          color: transaction.category.color,
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Sem categoria
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getAccountName(transaction)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariants[transaction.status]}>
                      {statusLabels[transaction.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 text-right wmin-w-max -20">
                      {transaction.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenMarkAsPaidDialog(
                              transaction as Transaction,
                            )
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleOpenEditDialog(transaction as Transaction)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredTransactions.length,
            )}{" "}
            de {filteredTransactions.length} transações
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore =
                    index > 0 && page - array[index - 1] > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        transaction={selectedTransaction}
      />

      {/* Mark as Paid Dialog */}
      <MarkAsPaidDialog
        transaction={transactionToMarkAsPaid}
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
      />
    </div>
  );
}
