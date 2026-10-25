import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, Compass } from "lucide-react";

const tabs = [
  { to: "/", label: "Inicio", icon: Home, testId: "nav-home" },
  { to: "/market", label: "Guía Comercial", icon: ShoppingBag, testId: "nav-market" },
  { to: "/conso", label: "Conso", icon: MessageCircle, testId: "nav-conso" },
  { to: "/transporte", label: "Transporte", icon: Compass, testId: "nav-transporte" },
];

export default function BottomNav() {
  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(26rem,calc(100%-1.25rem))]"
    >
      <div className="glass border border-border/70 rounded-full shadow-lg px-2 py-2 flex justify-between">
        {tabs.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={testId}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold ${
                isActive
                  ? "bg-[color:var(--terracotta)] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={18} />
            <span className="truncate max-w-[65px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}