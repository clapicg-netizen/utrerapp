import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar({ title, back = false, testId = "top-bar" }) {
  const [dark, setDark] = useState(() => localStorage.getItem("utrerapp_theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("utrerapp_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header
      data-testid={testId}
      className="glass sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-b border-border/60 flex items-center gap-3"
    >
      {back ? (
        <Link
          to="/"
          data-testid="top-back-btn"
          className="w-9 h-9 rounded-full grid place-items-center bg-muted hover:bg-muted/70"
        >
          <ArrowLeft size={18} />
        </Link>
      ) : (
        <div className="w-9 h-9 rounded-xl grid place-items-center bg-[color:var(--terracotta)] text-white font-display font-extrabold">
          U
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          Utrerapp · Sevilla
        </div>
        <h1 className="font-display font-extrabold text-lg leading-tight truncate">{title}</h1>
      </div>
      <button
        data-testid="theme-toggle"
        onClick={() => setDark(!dark)}
        className="w-9 h-9 rounded-full grid place-items-center bg-muted hover:bg-muted/70"
        aria-label="Cambiar tema"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
