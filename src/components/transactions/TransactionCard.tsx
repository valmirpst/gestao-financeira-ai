import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDateSafe } from "@/lib/utils";
import { TransactionStatus } from "@/types";
import { TransactionWithRelations } from "@/types/database.types";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { CheckCircle2, Edit, Trash2 } from "lucide-react";

interface TransactionCardProps {
  transaction: TransactionWithRelations;
  statusLabels: Record<TransactionStatus, string>;
  statusVariants: Record<
    TransactionStatus,
    "default" | "secondary" | "destructive" | "outline"
  >;
  getAccountName: (t: TransactionWithRelations) => string;
  onEdit: (t: TransactionWithRelations) => void;
  onDelete: (t: TransactionWithRelations) => void;
  onMarkAsPaid: (t: TransactionWithRelations) => void;
  isDeleting: boolean;
}

export function TransactionCard({
  transaction,
  statusLabels,
  statusVariants,
  getAccountName,
  onEdit,
  onDelete,
  onMarkAsPaid,
  isDeleting,
}: TransactionCardProps) {
  const controls = useAnimation();

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      await controls.start({ x: -150 });
    } else {
      await controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg bg-background">
      {/* Swipe Actions Background */}
      <div className="absolute inset-y-0 right-0 z-0 flex w-[150px]">
        {transaction.status === "pending" && (
          <Button
            variant="ghost"
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-none text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-800 dark:hover:text-green-200"
            onClick={() => {
              onMarkAsPaid(transaction);
              controls.start({ x: 0 });
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-none text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200"
          onClick={() => {
            onEdit(transaction);
            controls.start({ x: 0 });
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-none text-red-700 dark:text-red-600 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200"
          onClick={() => {
            onDelete(transaction);
            controls.start({ x: 0 });
          }}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 border bg-card shadow-sm"
      >
        <div
          className={cn("p-4", transaction.status === "paid" && "opacity-60")}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateSafe(transaction.date)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-bold",
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600",
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <Badge
                variant={statusVariants[transaction.status]}
                className="mt-1 h-5 px-1.5 text-[10px]"
              >
                {statusLabels[transaction.status]}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex gap-2">
              {transaction.category ? (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px]"
                  style={{
                    backgroundColor: transaction.category.color + "20",
                    borderColor: transaction.category.color,
                    color: transaction.category.color,
                  }}
                >
                  {transaction.category.name}
                </Badge>
              ) : (
                <span>Sem categoria</span>
              )}
              <span>{getAccountName(transaction)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
