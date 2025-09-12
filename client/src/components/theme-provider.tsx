import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (themeToApply: Theme) => {
      root.classList.remove("light", "dark");
      
      if (themeToApply === "system") {
        // Use matchMedia for better mobile browser compatibility
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.add(systemTheme);
        return systemTheme;
      }
      
      root.classList.add(themeToApply);
      return themeToApply;
    };

    // Apply initial theme
    const appliedTheme = applyTheme(theme);

    // Listen for system preference changes when using system theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if still using system theme
        if (theme === "system") {
          root.classList.remove("light", "dark");
          const newSystemTheme = e.matches ? "dark" : "light";
          root.classList.add(newSystemTheme);
        }
      };

      // Add listener for system preference changes
      if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      } else {
        // Modern approach
        mediaQuery.addEventListener("change", handleChange);
      }

      // Cleanup function
      return () => {
        if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleChange);
        } else {
          mediaQuery.removeEventListener("change", handleChange);
        }
      };
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};