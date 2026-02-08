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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMarkAsPaid } from "@/hooks/useTransactions";
import { cn, formatCurrency, formatDateSafe, parseDateSafe } from "@/lib/utils";
import type { Transaction } from "@/types/database.types";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CalendarIcon, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MarkAsPaidDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkAsPaidDialog({
  transaction,
  open,
  onOpenChange,
}: MarkAsPaidDialogProps) {
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const markAsPaidMutation = useMarkAsPaid();

  if (!transaction) return null;

  // Calculate days overdue
  const daysOverdue = transaction.due_date
    ? differenceInDays(new Date(), parseDateSafe(transaction.due_date))
    : 0;
  const isOverdue = daysOverdue > 0;

  // Calculate days late for payment
  const daysLate = transaction.due_date
    ? differenceInDays(paymentDate, parseDateSafe(transaction.due_date))
    : 0;
  const isPaidLate = daysLate > 0;

  const handleConfirm = async () => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: transaction.id,
        paymentDate: format(paymentDate, "yyyy-MM-dd"),
      });

      // Success message with late payment info
      if (isPaidLate) {
        toast.success(
          `Transação marcada como paga com ${daysLate} ${daysLate === 1 ? "dia" : "dias"} de atraso`,
          {
            icon: <CheckCircle className="h-5 w-5" />,
          },
        );
      } else {
        toast.success("Transação marcada como paga!", {
          icon: <CheckCircle className="h-5 w-5" />,
        });
      }

      onOpenChange(false);
      setPaymentDate(new Date()); // Reset to today
    } catch (error) {
      toast.error("Erro ao marcar transação como paga");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Marcar como Paga
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes do pagamento desta transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Descrição
              </label>
              <p className="text-base font-medium">{transaction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Valor
                </label>
                <p className="text-lg font-bold">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Vencimento
                </label>
                <p className="text-base font-medium">
                  {transaction.due_date
                    ? formatDateSafe(transaction.due_date)
                    : "-"}
                </p>
              </div>
            </div>

            {/* Overdue Warning */}
            {isOverdue && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                  {daysOverdue === 1
                    ? "1 dia em atraso"
                    : `${daysOverdue} dias em atraso`}
                </p>
              </div>
            )}
          </div>

          {/* Payment Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de Pagamento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Late Payment Warning */}
            {isPaidLate && (
              <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-amber-700 dark:text-amber-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                  Pagamento será registrado com {daysLate}{" "}
                  {daysLate === 1 ? "dia" : "dias"} de atraso
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={markAsPaidMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={markAsPaidMutation.isPending}
          >
            {markAsPaidMutation.isPending
              ? "Confirmando..."
              : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
