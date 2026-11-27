import { useEffect, useState } from 'react';
import { utreraDaylight } from '../lib/utreraDaylight';
import night from './panorama-utrera-portada.webp';
import nightMobile from './panorama-utrera-portada-640.webp';
import day from './santuario-utrera-portada.webp';

const preview = process.env.REACT_APP_PORTADA_SOLAR_PREVIEW === 'true'
  ? new URLSearchParams(window.location.search).get('portada')
  : null;

export default function useHomePhoto() {
  const [daylight, setDaylight] = useState(() => utreraDaylight().daylight);
  useEffect(() => {
    if (preview === 'dia' || preview === 'noche') return undefined;
    let timer;
    function update() {
      window.clearTimeout(timer);
      const now = new Date();
      const { sunrise, sunset, daylight: isDay } = utreraDaylight(now);
      setDaylight(isDay);
      const next = now < sunrise ? sunrise : sunset;
      timer = window.setTimeout(update, next > now ? Math.min(next - now, 60_000) : 60_000);
    }
    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pageshow', update);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('pageshow', update);
    };
  }, []);

  const isDay = preview === 'dia' || (preview !== 'noche' && daylight);
  return isDay ? { src: day, isDay } : { src: night, mobileSrc: nightMobile, isDay };
}
