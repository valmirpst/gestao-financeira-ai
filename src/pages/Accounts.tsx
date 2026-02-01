import { AccountDialog } from "@/components/accounts/AccountDialog";
import { TransferDialog } from "@/components/accounts/TransferDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/utils";
import { AccountWithProjection } from "@/types/database.types";
import { Archive, ArrowLeftRight, Edit, HelpCircle, Plus } from "lucide-react";
import { useState } from "react";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Corrente",
  savings: "Poupança",
  cash: "Dinheiro",
  investment: "Investimento",
  other: "Outro",
};

export default function Accounts() {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AccountWithProjection | undefined
  >(undefined);

  // Fetch data
  const { data: accounts = [], isLoading } = useActiveAccounts();

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setSelectedAccount(undefined);
    setAccountDialogOpen(true);
  };

  const handleOpenEditDialog = (account: AccountWithProjection) => {
    setSelectedAccount(account);
    setAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
    setSelectedAccount(undefined);
  };

  const handleOpenTransferDialog = () => {
    setTransferDialogOpen(true);
  };

  const handleCloseTransferDialog = () => {
    setTransferDialogOpen(false);
  };

  // Render account card
  const renderAccountCard = (account: AccountWithProjection) => {
    const isPositive = account.current_balance >= 0;
    const hasProjectedBalance = account.projected_balance !== undefined;

    return (
      <Card key={account.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {ACCOUNT_TYPE_LABELS[account.type] || account.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saldo Atual */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
            <p
              className={`text-3xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(account.current_balance)}
            </p>
          </div>

          {/* Saldo Projetado */}
          {hasProjectedBalance && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Saldo Projetado
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Saldo estimado considerando transações pendentes e
                          recorrentes futuras
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-lg font-semibold text-muted-foreground">
                  {formatCurrency(account.projected_balance)}
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleOpenEditDialog(account)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenTransferDialog}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas e transferências
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenTransferDialog}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Nova Transferência
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhuma conta cadastrada ainda
          </p>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeira Conta
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => renderAccountCard(account))}
        </div>
      )}

      {/* Account Dialog */}
      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={handleCloseAccountDialog}
        account={selectedAccount}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={handleCloseTransferDialog}
      />
    </div>
  );
}
