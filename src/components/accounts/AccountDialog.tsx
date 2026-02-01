import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/hooks/useAccounts";
import type { Account, AccountInsert } from "@/types/database.types";
import { toast } from "sonner";
import { AccountForm } from "./AccountForm";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}

export function AccountDialog({
  open,
  onOpenChange,
  account,
}: AccountDialogProps) {
  const isEditing = !!account;

  // Mutations
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const handleSubmit = async (data: AccountInsert) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: account.id,
          updates: data,
        });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Conta criada com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar conta" : "Erro ao criar conta",
      );
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    if (!confirm("Tem certeza que deseja arquivar esta conta?")) return;

    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success("Conta arquivada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao arquivar conta");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Convert account to form values if editing
  const defaultValues = account
    ? {
        name: account.name,
        type: account.type,
        initial_balance: account.initial_balance,
        currency: account.currency,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da conta abaixo."
              : "Preencha os dados para criar uma nova conta."}
          </DialogDescription>
        </DialogHeader>

        <AccountForm
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
