import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "./components/ui/sonner";
import { configErrors } from "./lib/config";
import "./index.css";
import { ThemeProvider } from "./providers/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (configErrors.length > 0) {
  root.render(
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div role="alert" className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Não foi possível iniciar o aplicativo</h1>
        <p className="mt-3 text-muted-foreground">A configuração do Supabase está ausente ou inválida. Verifique:</p>
        <ul className="mt-3 list-inside list-disc font-mono text-sm">
          {configErrors.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Configure as variáveis de ambiente com os dados do seu projeto Supabase. Em desenvolvimento, consulte o
          arquivo .env.example e reinicie o servidor após alterá-las.
        </p>
      </div>
    </main>,
  );
} else {
  // Load the app only after checking configuration: its imports create the Supabase client.
  import("./App")
    .then(({ default: App }) => {
      root.render(
        <React.StrictMode>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <Toaster />
            </QueryClientProvider>
          </ThemeProvider>
        </React.StrictMode>,
      );
    })
    .catch((error) => {
      console.error("Não foi possível iniciar o aplicativo:", error);
      root.render(
        <main role="alert" className="p-6">
          Não foi possível iniciar o aplicativo. Recarregue a página e tente novamente.
        </main>,
      );
    });
}
