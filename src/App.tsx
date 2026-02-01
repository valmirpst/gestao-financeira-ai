import { Layout } from "@/components/layout/Layout";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Accounts from "./pages/Accounts";
import Bills from "./pages/Bills";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/budgets"
            element={<div>Orçamentos - Em construção</div>}
          />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
