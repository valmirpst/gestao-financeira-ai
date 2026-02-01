import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React-related libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // Split Supabase into its own chunk
          supabase: ["@supabase/supabase-js"],

          // Split React Query
          "react-query": ["@tanstack/react-query"],

          // Split all Radix UI components into one chunk
          "radix-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],

          // Split charting library
          charts: ["recharts"],

          // Split date utilities
          "date-utils": ["date-fns", "react-day-picker"],

          // Split form libraries
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],

          // Split UI utilities
          "ui-utils": [
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "tailwindcss-animate",
            "sonner",
          ],
        },
      },
    },
    // Increase the warning limit to 1000 KB (still warns, but less aggressively)
    chunkSizeWarningLimit: 1000,
  },
});
