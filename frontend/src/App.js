import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import Conso from "@/pages/Conso";
import Farmacias from "@/pages/Farmacias";
import Teatro from "@/pages/Teatro";
import Transporte from "@/pages/Transporte";
import Eventos from "@/pages/Eventos";
import UtreraTV from "@/pages/UtreraTV";
import Noticias from "@/pages/Noticias";
import Urgencias from "@/pages/Urgencias";
import Market from "@/pages/Market";
import Vivienda from "@/pages/Vivienda";
import Tablon from "@/pages/Tablon";
import Bares from "@/pages/Bares";
import Admin from "@/pages/Admin";

function App() {
  return (
    <div className="min-h-screen" data-testid="utrerapp-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conso" element={<Conso />} />
          <Route path="/farmacias" element={<Farmacias />} />
          <Route path="/teatro" element={<Teatro />} />
          <Route path="/transporte" element={<Transporte />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/utreratv" element={<UtreraTV />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/urgencias" element={<Urgencias />} />
          <Route path="/market" element={<Market />} />
          <Route path="/vivienda" element={<Vivienda />} />
          <Route path="/tablon" element={<Tablon />} />
          <Route path="/bares" element={<Bares />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
