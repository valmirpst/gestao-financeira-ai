import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="pb-16 md:pb-0 md:pl-64">
        <Header />

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
