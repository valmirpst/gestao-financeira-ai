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
import { useMarkMultipleAsPaid } from "@/hooks/useTransactions";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { useState } from "react";

interface MarkMultipleAsPaidDialogProps {
  transactionIds: string[];
  totalAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkMultipleAsPaidDialog({
  transactionIds,
  totalAmount,
  open,
  onOpenChange,
  onSuccess,
}: MarkMultipleAsPaidDialogProps) {
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const markAsPaidMutation = useMarkMultipleAsPaid();

  const handleConfirm = async () => {
    try {
      await markAsPaidMutation.mutateAsync({
        ids: transactionIds,
        paymentDate: format(paymentDate, "yyyy-MM-dd"),
      });

      onOpenChange(false);
      setPaymentDate(new Date()); // Reset to today
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Marcar Selecionadas como Pagas
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes do pagamento para as {transactionIds.length}{" "}
            transações selecionadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary Details */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Quantidade
                </label>
                <p className="text-base font-medium">
                  {transactionIds.length} transações
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </label>
                <p className="text-lg font-bold">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
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
              : `Confirmar ${transactionIds.length} Pagamentos`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
