import React, { useEffect, useState } from 'react';
import DesktopHome from '../pages/DesktopHome';
import Home from '../pages/Home';
import { previewUrl } from '../conso/ConsoPreviewRoute';
import { marketAdminUrl, marketUrl } from './config';

export default function MarketPreviewHome() {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const viewport = window.matchMedia('(min-width: 1024px)');
    const update = event => setDesktop(event.matches);
    viewport.addEventListener('change', update);
    return () => viewport.removeEventListener('change', update);
  }, []);

  function navigate(section, query) {
    if (section === 'admin') window.location.assign(marketAdminUrl);
    else if (section === 'market') window.location.assign(previewUrl('guia', query));
    else if (section === 'hosteleria') window.location.assign(marketUrl);
    else if (['conso', 'farmacias', 'trenes', 'cercanias', 'gasolineras'].includes(section)) {
      window.location.assign(previewUrl(section === 'cercanias' ? 'trenes' : section));
    }
    else setNotice('Esta vista privada está dedicada a la prueba de UtreraMarket.');
  }

  return <>
    {desktop ? <DesktopHome onNavigate={navigate} /> : <Home setPaginaActual={navigate} />}
    <div className="utreramarket-preview-tools">
      <a href={marketAdminUrl}>Administración de prueba</a>
      {notice && <p role="status">{notice}</p>}
    </div>
  </>;
}
