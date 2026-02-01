import React from "react";

export type Theme = "light" | "dark" | "system";

export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: (theme: Theme) => void;
} | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize theme from localStorage or default to "system"
  const [theme, setTheme] = React.useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    return savedTheme || "system";
  });

  // Apply theme to HTML element
  React.useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first to avoid conflicts
    root.classList.remove("light", "dark");

    if (theme === "light") {
      // Explicitly set light theme
      root.classList.add("light");
    } else if (theme === "dark") {
      // Explicitly set dark theme
      root.classList.add("dark");
    } else {
      // System theme: check system preference
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      if (systemPrefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    }
  }, [theme]);

  // Listen to system theme changes when theme is set to "system"
  React.useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");

      if (e.matches) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    };

    // Add listener for system theme changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const toggleTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
