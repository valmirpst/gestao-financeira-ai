import { Layout } from "@/components/layout/Layout";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<div>Dashboard - Em construção</div>}
          />
          <Route
            path="/transactions"
            element={<div>Transações - Em construção</div>}
          />
          <Route
            path="/bills"
            element={<div>Contas a Pagar/Receber - Em construção</div>}
          />
          <Route
            path="/categories"
            element={<div>Categorias - Em construção</div>}
          />
          <Route
            path="/budgets"
            element={<div>Orçamentos - Em construção</div>}
          />
          <Route path="/accounts" element={<div>Contas - Em construção</div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
