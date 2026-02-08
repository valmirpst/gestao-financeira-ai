import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { parseDateSafe } from "@/lib/utils";
import type {
  Transaction,
  TransactionInsert,
  TransactionWithRelations,
} from "@/types/database.types";
import { toast } from "sonner";
import { TransactionForm } from "./TransactionForm";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | TransactionWithRelations;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDialogProps) {
  const isEditing = !!transaction;

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleSubmit = async (data: TransactionInsert) => {
    console.log(data);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          updates: data,
        });
        toast.success("Transação atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Transação criada com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    if (!confirm("Tem certeza que deseja deletar esta transação?")) return;

    try {
      await deleteMutation.mutateAsync(transaction.id);
      toast.success("Transação deletada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao deletar transação");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Convert transaction to form values if editing
  const defaultValues = transaction
    ? {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id || undefined,
        // Extract account_id from account relation if available
        account_id:
          "account" in transaction && transaction.account
            ? transaction.account.id
            : "",
        // Map database status to form-compatible values
        // Form only accepts "paid" or "pending"
        status: (transaction.status === "paid" ? "paid" : "pending") as
          | "paid"
          | "pending",
        payment_date: transaction.payment_date
          ? parseDateSafe(transaction.payment_date)
          : transaction.is_recurring
            ? parseDateSafe(transaction.date)
            : undefined,
        due_date: transaction.due_date
          ? parseDateSafe(transaction.due_date)
          : undefined,
        tags: transaction.tags || [],
        is_recurring: transaction.is_recurring,
        recurrence_frequency: transaction.recurrence_config?.frequency,
        recurrence_interval: transaction.recurrence_config?.interval || 1,
        recurrence_end_date: transaction.recurrence_config?.end_date
          ? parseDateSafe(transaction.recurrence_config.end_date)
          : undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Criar Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações necessárias nos campos abaixo."
              : "Preencha as informações para registrar uma entrada ou saída de dinheiro."}
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
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
