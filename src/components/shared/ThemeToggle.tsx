"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("corden-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("corden-theme", next);
  };

  if (!mounted) {
    return <div style={{ width: 40, height: 22 }} />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
        cursor: "pointer",
        padding: 0,
        transition: "all 300ms ease",
      }}
    >
      <div style={{
        position: "absolute",
        top: 2,
        left: theme === "dark" ? 2 : 22,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: theme === "dark" ? "#4A90E2" : "#F59E0B",
        transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
      }}>
        {theme === "dark" ? <Moon size={12} color="#1A2E48" /> : <Sun size={12} color="#fff" />}
      </div>
    </button>
  );
}
