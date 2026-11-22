import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';

export default function CarruselVehiculos({ vehiculos, headingId }) {
  const [api, setApi] = useState();
  const [posicion, setPosicion] = useState(0);

  useEffect(() => {
    if (!api) return;
    const actualizar = () => setPosicion(api.selectedScrollSnap());
    actualizar();
    api.on('select', actualizar);
    api.on('reInit', actualizar);
    return () => {
      api.off('select', actualizar);
      api.off('reInit', actualizar);
    };
  }, [api]);

  if (!vehiculos.length) return null;

  return (
    <section className="min-w-0" aria-labelledby={headingId}>
      <h2 id={headingId}>Vehículos destacados</h2>
      <Carousel setApi={setApi} aria-labelledby={headingId}>
        <CarouselContent className="touch-pan-y">
          {vehiculos.map(({ nombre, imagen, enlace }, index) => (
            <CarouselItem key={enlace || nombre} aria-label={`${index + 1} de ${vehiculos.length}`} inert={index !== posicion}>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img src={imagen} alt={nombre} width="670" height="372" decoding="async" loading={index === 0 ? 'eager' : 'lazy'} className="aspect-[670/372] w-full object-cover" />
                <div className="px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-900">{nombre}</h3>
                  {enlace && <a className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-800" href={enlace} target="_blank" rel="noreferrer">
                    Ver ficha del vehículo <ArrowUpRight size={15} aria-hidden="true" />
                  </a>}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {vehiculos.length > 1 && <div className="mt-2 flex items-center justify-between gap-2">
          <button type="button" className="commerce-carousel-arrow" aria-label="Vehículo anterior" aria-disabled={posicion === 0} onClick={() => posicion > 0 && api?.scrollPrev()}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="flex items-center justify-center">
            {vehiculos.map(({ enlace, nombre }, index) => (
              <button type="button" key={enlace || nombre} className="commerce-carousel-dot" aria-label={`Ir al vehículo ${index + 1} de ${vehiculos.length}`} aria-current={index === posicion ? 'true' : undefined} onClick={() => api?.scrollTo(index)}>
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" className="commerce-carousel-arrow" aria-label="Vehículo siguiente" aria-disabled={posicion === vehiculos.length - 1} onClick={() => posicion < vehiculos.length - 1 && api?.scrollNext()}>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <span className="sr-only" role="status">Vehículo {posicion + 1} de {vehiculos.length}</span>
        </div>}
      </Carousel>
    </section>
  );
}
