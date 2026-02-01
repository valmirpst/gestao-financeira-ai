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
import type { Transaction, TransactionInsert } from "@/types/database.types";
import { toast } from "sonner";
import { TransactionForm } from "./TransactionForm";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
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
      toast.error(
        isEditing ? "Erro ao atualizar transação" : "Erro ao criar transação",
      );
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
        account_id: "", // Will be filled from account_transactions relation
        // Map database status to form-compatible values
        // Form only accepts "paid" or "pending"
        status: (transaction.status === "paid" ? "paid" : "pending") as
          | "paid"
          | "pending",
        payment_date: transaction.payment_date
          ? new Date(transaction.payment_date)
          : undefined,
        due_date: transaction.due_date
          ? new Date(transaction.due_date)
          : undefined,
        tags: transaction.tags || [],
        is_recurring: transaction.is_recurring,
        recurrence_frequency: transaction.recurrence_config?.frequency,
        recurrence_interval: transaction.recurrence_config?.interval,
        recurrence_end_date: transaction.recurrence_config?.end_date
          ? new Date(transaction.recurrence_config.end_date)
          : undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da transação abaixo."
              : "Preencha os dados para criar uma nova transação."}
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
