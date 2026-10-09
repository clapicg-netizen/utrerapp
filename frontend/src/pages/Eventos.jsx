import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";

export default function Eventos() {
  return (
    <div className="app-shell" data-testid="eventos-page">
      <TopBar title="Eventos · Utrerapp" back testId="eventos-topbar" />
      <div className="mt-4 p-4 text-center">
        <h2 className="font-display font-bold text-lg">Agenda de Eventos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Próximamente los eventos, cultura y fiestas de Utrera.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}