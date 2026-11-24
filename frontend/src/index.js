import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";
import DashboardAdmin from "@/pages/DashboardAdmin";
import { retornoRecuperacion } from "@/lib/supabaseClient";

if (retornoRecuperacion && window.location.pathname === "/") {
  const retorno = new URL(window.location.href);
  retorno.pathname = "/admin";
  retorno.searchParams.set("recuperar", "1");
  window.history.replaceState(window.history.state, "", retorno);
}

const esPanelAdmin = /^\/admin\/?$/.test(window.location.pathname);

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
      {esPanelAdmin ? <DashboardAdmin /> : <App />}
    </QueryClientProvider>
  </React.StrictMode>,
);
