import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="pb-16 md:pb-0 md:pl-64">
        <Header />

        {/* Page content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
            >
              {React.isValidElement(children)
                ? React.cloneElement(children, { location } as any)
                : children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
