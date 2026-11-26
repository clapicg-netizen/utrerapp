import ConsoPreviewRoute, { consoPreviewViews } from "@/conso/ConsoPreviewRoute";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";
import MarketEntry from "@/market/MarketEntry";
import { MarketAdminPreview } from "@/market/MarketAdmin";
import { hostedMarketPreview, marketEnabled, persistentMarket } from "@/market/config";
import MarketPreviewHome from "@/market/MarketPreviewHome";
import DashboardAdmin from "@/pages/DashboardAdmin";
import { retornoRecuperacion } from "@/lib/supabaseClient";

const params = new URLSearchParams(window.location.search);
const esAgendaTeatro = params.get('vista') === 'gestor-teatro';

if (!esAgendaTeatro && retornoRecuperacion && window.location.pathname === "/") {
  const retorno = new URL(window.location.href);
  retorno.pathname = "/admin";
  retorno.searchParams.set("recuperar", "1");
  window.history.replaceState(window.history.state, "", retorno);
}

const esMarket = marketEnabled && (hostedMarketPreview || window.location.pathname === '/') &&
  params.get('vista') === 'utreramarket';
const esPanelAdmin = /^\/admin\/?$/.test(window.location.pathname);

// The local package can exercise the market editor without a production admin session.
const esAdminMarketLocal = marketEnabled && !persistentMarket && esPanelAdmin &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
  new URLSearchParams(window.location.search).get('prueba') === 'utreramarket';

function Page() {
  if (hostedMarketPreview) {
    if (params.get('prueba') === 'utreramarket') return <MarketAdminPreview />;
    const view = params.get('vista');
    if (consoPreviewViews.includes(view)) return <ConsoPreviewRoute view={view} query={params.get('q') || ''} />;
    return esMarket ? <MarketEntry /> : <MarketPreviewHome />;
  }
  const view = params.get('vista');
  if (persistentMarket && window.location.pathname === '/' && (
    view === 'conso' || (params.get('desde') === 'conso' && ['farmacias', 'trenes', 'gasolineras'].includes(view))
  )) return <ConsoPreviewRoute view={view} />;
  if (esAdminMarketLocal) return <MarketAdminPreview />;
  if (esPanelAdmin || esAgendaTeatro) return <DashboardAdmin soloAgenda={esAgendaTeatro} />;
  return esMarket ? <MarketEntry /> : <App />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  </React.StrictMode>,
);
