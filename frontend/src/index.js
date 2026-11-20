import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AdminComercios from './pages/AdminComercios';

function Preview() {
  const [visible, setVisible] = useState(true);
  return <main>
    <p className="bg-amber-100 px-4 py-3 text-center text-amber-950">Vista previa de Comercios · Datos ficticios · Los cambios se pierden al recargar.</p>
    {visible ? <AdminComercios onBack={() => setVisible(false)} /> : <div className="p-4">
      <button type="button" onClick={() => setVisible(true)}>Abrir panel de demostración</button>
    </div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<Preview />);
