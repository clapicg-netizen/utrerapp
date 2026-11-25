import React from "react";
import { Image, MapPin, Phone } from "lucide-react";

const obtenerPortadaValida = (url) => {
    if (url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY" && url !== "NULL") {
      return url.trim();
    }
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";
  };

export default function FichaComercialEstandar({ comercio, ampliarFoto }) {
  return (
    <div>
      <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative mb-4 border">
        <img src={obtenerPortadaValida(comercio.portada_url)} alt={comercio.nombre} className="w-full h-full object-cover" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800">{comercio.nombre}</h2>
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-0.5">
          {comercio.subcategoria || comercio.categoria}
        </p>
      </div>

      {comercio.direccion && (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <MapPin size={14} className="text-slate-400" /> {comercio.direccion}
        </p>
      )}

      {comercio.descripcion && (
        <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border">
          {comercio.descripcion}
        </p>
      )}

      {/* VÍDEO PROMOCIONAL INTELIGENTE EN LA VISTA PÚBLICA */}
      {comercio.video_story_url && typeof comercio.video_story_url === 'string' && comercio.video_story_url.trim() !== '' && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            🎬 Vídeo Promocional
          </p>
          {comercio.video_story_url.includes('youtube.com') || comercio.video_story_url.includes('youtu.be') ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src={
                  comercio.video_story_url.includes('watch?v=') 
                    ? comercio.video_story_url.replace('watch?v=', 'embed/') 
                    : comercio.video_story_url.includes('youtu.be/')
                    ? `https://www.youtube.com/embed/${comercio.video_story_url.split('youtu.be/')[1]?.split('?')[0]}`
                    : comercio.video_story_url
                }
                title={`Vídeo de ${comercio.nombre}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-black border shadow-sm">
              <video 
                src={comercio.video_story_url.trim()} 
                controls 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* GALERÍA DE FOTOS EN LA VISTA */}
      {comercio.galeria_urls && Array.isArray(comercio.galeria_urls) && comercio.galeria_urls.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Image size={14} /> Galería de Fotos
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {comercio.galeria_urls.map((url, i) => (
              url && (
                <div 
                  key={i} 
                  onClick={() => ampliarFoto(url.trim())}
                  className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border cursor-pointer hover:opacity-90"
                >
                  <img src={url.trim()} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* SITIO WEB Y TIENDA ONLINE EN LA VISTA PÚBLICA */}
      {(comercio.web_url || comercio.tienda_url) && (
        <div className="mt-4 pt-3 border-t flex gap-2">
          {comercio.web_url && (
            <a href={comercio.web_url.startsWith('http') ? comercio.web_url : `https://${comercio.web_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
              🌐 Web Oficial
            </a>
          )}
          {comercio.tienda_url && (
            <a href={comercio.tienda_url.startsWith('http') ? comercio.tienda_url : `https://${comercio.tienda_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-amber-500 text-slate-950 py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
              🛍️ Tienda Online
            </a>
          )}
        </div>
      )}

      {/* REDES SOCIALES EN LA VISTA PÚBLICA */}
      {(() => {
        const insta = comercio.instagram_url || comercio.instagram_username;
        const tiktok = comercio.tiktok_url;
        const facebook = comercio.facebook_url;

        if (!insta && !tiktok && !facebook) return null;

        return (
          <div className="mt-3 pt-2 flex gap-2">
            {insta && (
              <a 
                href={insta.startsWith('http') ? insta : `https://${insta}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 bg-pink-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
              >
                Instagram
              </a>
            )}
            {tiktok && (
              <a 
                href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 bg-black text-white py-2 rounded-xl text-center text-xs font-bold shadow"
              >
                TikTok
              </a>
            )}
            {facebook && (
              <a 
                href={facebook.startsWith('http') ? facebook : `https://${facebook}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
              >
                Facebook
              </a>
            )}
          </div>
        );
      })()}

      {/* BOTONES DE CONTACTO */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {comercio.whatsapp && (
          <a
            href={"https://wa.me/" + comercio.whatsapp.replace("+", "").replace(/\s/g, "")}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
          >
            💬 WhatsApp
          </a>
        )}
        {comercio.telefono && (
          <a
            href={"tel:" + comercio.telefono}
            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Phone size={14} className="text-emerald-600" /> Llamar
          </a>
        )}
      </div>
    </div>
  );
}
