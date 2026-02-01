import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="pl-64">
        <Header />

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
