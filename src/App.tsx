import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Layout = lazy(() => import("@/components/layout/Layout").then(({ Layout }) => ({ default: Layout })));
const Accounts = lazy(() => import("./pages/Accounts"));
const Bills = lazy(() => import("./pages/Bills"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Categories = lazy(() => import("./pages/Categories"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Transactions = lazy(() => import("./pages/Transactions"));
const PreviewPage = lazy(() => import("./preview/PreviewPage").then(({ PreviewPage }) => ({ default: PreviewPage })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center text-muted-foreground" role="status">
              Carregando...
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/bills" element={<Bills />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/accounts" element={<Accounts />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
