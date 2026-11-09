import React, { useState, useEffect } from 'react';

export default function TrenesUtrera() {
    const [datosTrenes, setDatosTrenes] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [pestanaActiva, setPestanaActiva] = useState('sevilla');
    const [alertaAbierta, setAlertaAbierta] = useState(false);
    const [tiempoActual, setTiempoActual] = useState(new Date());

    const fetchTrenes = async () => {
        try {
            setCargando(true);
            const res = await fetch('/api/trenes');
            const data = await res.json();
            setDatosTrenes(data);
        } catch (err) {
            console.error("Error sincronizando trenes:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchTrenes();
        const intervalApi = setInterval(fetchTrenes, 20000);
        const timerClock = setInterval(() => setTiempoActual(new Date()), 1000);

        return () => {
            clearInterval(intervalApi);
            clearInterval(timerClock);
        };
    }, []);

    const ahoraMinutos = tiempoActual.getHours() * 60 + tiempoActual.getMinutes();

    const obtenerProximo = (lista) => {
        if (!lista) return null;
        const futuros = lista.filter(t => (t.h * 60 + t.m) >= ahoraMinutos);
        return futuros.length > 0 ? futuros[0] : null;
    };

    const siguientesA = (lista) => {
        if (!lista) return [];
        const futuros = lista.filter(t => (t.h * 60 + t.m) >= ahoraMinutos);
        return futuros.length > 1 ? futuros.slice(1) : [];
    };

    const proximoSevilla = datosTrenes ? obtenerProximo(datosTrenes.salidasSevilla) : null;
    const minSevilla = proximoSevilla ? Math.max((proximoSevilla.h * 60 + proximoSevilla.m) - ahoraMinutos, 0) : 0;
    const siguientesSevilla = datosTrenes ? siguientesA(datosTrenes.salidasSevilla) : [];

    const proximoCadiz = datosTrenes ? obtenerProximo(datosTrenes.salidasCadiz) : null;
    const minCadiz = proximoCadiz ? Math.max((proximoCadiz.h * 60 + proximoCadiz.m) - ahoraMinutos, 0) : 0;
    const siguientesCadiz = datosTrenes ? siguientesA(datosTrenes.salidasCadiz) : [];

    const compartirWhatsApp = (tipo, destino, hora, detalle) => {
        const texto = encodeURIComponent(`🚆 Tren ${tipo} Utrera - ${destino} (${hora}). ${detalle}. \n\n📍 Utrerapp Live: https://utrerapp.com`);
        window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#f7f4eb] text-[#2c2416] font-sans pb-20 max-w-xl mx-auto px-4 pt-4 selection:bg-amber-200">
            
            {/* CABECERA */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#e6decb]">
                <h1 className="text-2xl font-black tracking-tight text-[#3c2f20] font-serif">
                    El tren <span className="text-[#a67c37] font-sans font-bold text-base">en Utrera</span>
                </h1>
                <button 
                    onClick={fetchTrenes}
                    disabled={cargando}
                    className="bg-[#eddcc3] hover:bg-[#e2ceb0] text-[#4a3b2c] px-4 py-1.5 rounded-full text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                >
                    <span className="text-amber-700">⚡</span> {cargando ? 'Actualizando' : 'Ahora'}
                </button>
            </div>

            {/* PESTAÑAS SUPERIORES */}
            <div className="flex gap-6 mb-4 border-b border-[#e6decb] pb-2">
                <button
                    onClick={() => setPestanaActiva('sevilla')}
                    className={`text-xl font-black transition pb-2 relative font-serif ${
                        pestanaActiva === 'sevilla' ? 'text-[#2c2416] border-b-2 border-[#a67c37]' : 'text-[#a39885] hover:text-[#5c503d]'
                    }`}
                >
                    A Sevilla
                </button>
                <button
                    onClick={() => setPestanaActiva('cadiz')}
                    className={`text-xl font-black transition pb-2 relative font-serif ${
                        pestanaActiva === 'cadiz' ? 'text-[#2c2416] border-b-2 border-[#a67c37]' : 'text-[#a39885] hover:text-[#5c503d]'
                    }`}
                >
                    A Lebrija y Cádiz
                </button>
            </div>

            {/* AVISO OFICIAL */}
            <div 
                onClick={() => setAlertaAbierta(!alertaAbierta)}
                className="bg-[#efe8d8] border border-[#e2d7be] p-3.5 rounded-2xl shadow-2xs mb-4 cursor-pointer hover:bg-[#e8dec7] transition flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <span className="text-amber-800 text-base">⚠️</span>
                    <span className="text-xs font-bold text-[#3c2f20]">
                        Aviso de Renfe para Utrera · <span className="underline font-normal text-[#6c5d47]">léelo abajo</span>
                    </span>
                </div>
                <span className="text-[#8c7d67] text-xs font-bold">{alertaAbierta ? '▲' : '▼'}</span>
            </div>

            {alertaAbierta && (
                <div className="bg-[#efe8d8] border border-[#e2d7be] p-4 rounded-2xl text-xs text-[#3c2f20] space-y-1 mb-4 shadow-inner">
                    <p className="font-bold">Con motivo de la huelga convocada por el sindicato de maquinistas semaf, el servicio se verá muy afectado en los trenes de cercanías.</p>
                    <span className="text-[10px] text-[#8c7d67] font-semibold block">Desde ayer a las 19:51</span>
                </div>
            )}

            <div className="mb-4 text-[11px] text-[#7a6c58] font-medium flex items-center justify-between">
                <span><span className="font-bold text-[#4a3b2c] underline cursor-pointer">Novedades</span>: la última mejora, el 9 de noviembre</span>
                <span className="text-[10px] bg-[#e6decb]/60 px-2 py-0.5 rounded text-[#5c503d] font-mono">GPS Activo</span>
            </div>

            {/* ================= VISTA SEVILLA ================= */}
            {pestanaActiva === 'sevilla' && (
                <div className="space-y-5">
                    {proximoSevilla ? (
                        <div className="bg-[#fdfbf7] rounded-3xl p-6 shadow-2xs border border-[#e6decb] relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#1d6fa5] text-white text-[11px] font-black px-2 py-0.5 rounded-md">C1</span>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#2c2416] tracking-tight">{proximoSevilla.destino}</h3>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold ${proximoSevilla.estado.includes('tarde') ? 'bg-[#fae1db] text-[#b93822]' : 'bg-[#e1f3e8] text-[#1e6b36]'}`}>
                                    {proximoSevilla.estado}
                                </span>
                            </div>
                            <p className="text-xs text-[#8c7d67] mb-3 font-medium">el de las <span className="font-bold text-[#3c2f20]">{String(proximoSevilla.h).padStart(2, '0')}:{String(proximoSevilla.m).padStart(2, '0')}</span></p>

                            <div className="flex items-baseline justify-between my-3">
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-[#2c2416] tracking-tighter font-serif">
                                        {minSevilla}–{minSevilla + 5}
                                    </span>
                                    <span className="text-base font-bold text-[#6c5d47] ml-1">min</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] text-[#8c7d67] block font-medium">Sale entre</span>
                                    <span className="text-sm font-black text-[#2c2416]">
                                        {String(proximoSevilla.h).padStart(2, '0')}:{String(proximoSevilla.m).padStart(2, '0')} y {String(proximoSevilla.h).padStart(2, '0')}:{String(proximoSevilla.m + 5).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 my-3">
                                <span className="bg-[#4a3b2c] text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                                    📌 {proximoSevilla.via}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${proximoSevilla.por_gps ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'}`}>
                                    {proximoSevilla.por_gps ? '📍 Posición GPS' : '🕒 Horario oficial'}
                                </span>
                            </div>

                            <p className="text-xs text-[#6c5d47] font-medium mb-4 bg-[#f5efe3] p-3 rounded-xl border border-[#e6decb]/60">
                                {proximoSevilla.tramo}
                            </p>

                            <button 
                                onClick={() => compartirWhatsApp("hacia", proximoSevilla.destino, `${proximoSevilla.h}:${proximoSevilla.m}`, proximoSevilla.tramo)}
                                className="w-full bg-[#dfb15b] hover:bg-[#d09e43] text-[#2c2416] font-bold text-xs py-3.5 px-4 rounded-2xl transition shadow-2xs flex items-center justify-center gap-2"
                            >
                                <span>📤</span> Avisa a quien vaya contigo
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#fdfbf7] rounded-3xl p-8 text-center border border-[#e6decb]">
                            <p className="text-sm font-bold text-[#6c5d47]">No hay más servicios programados hoy hacia Sevilla.</p>
                        </div>
                    )}

                    {/* SECCIÓN DESPUÉS */}
                    {siguientesSevilla.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-sm font-black text-[#3c2f20] uppercase tracking-wider font-serif">Después</h3>
                            <div className="bg-[#fdfbf7] rounded-3xl p-2 shadow-2xs border border-[#e6decb] divide-y divide-[#e6decb]/50">
                                {siguientesSevilla.map((t, idx) => (
                                    <div key={idx} className="py-3 px-3 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <span className="font-black text-[#2c2416] text-sm font-serif block">{String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${t.destino.includes('MD') || t.destino.includes('Jaén') ? 'bg-[#2c2416]' : 'bg-[#1d6fa5]'}`}>
                                                {t.destino.includes('Jaén') ? 'MD' : 'C1'}
                                            </span>
                                            <span className="font-bold text-[#3c2f20]">{t.destino}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${t.estado.includes('tarde') ? 'bg-[#fae1db] text-[#b93822]' : 'bg-[#e1f3e8] text-[#1e6b36]'}`}>
                                            {t.estado}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================= VISTA CÁDIZ ================= */}
            {pestanaActiva === 'cadiz' && (
                <div className="space-y-5">
                    {proximoCadiz ? (
                        <div className="bg-[#fdfbf7] rounded-3xl p-6 shadow-2xs border border-[#e6decb] relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#2c2416] text-white text-[11px] font-black px-2 py-0.5 rounded">MD</span>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#2c2416] tracking-tight">{proximoCadiz.destino}</h3>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold ${proximoCadiz.estado.includes('tarde') ? 'bg-[#fae1db] text-[#b93822]' : 'bg-[#e1f3e8] text-[#1e6b36]'}`}>
                                    {proximoCadiz.estado}
                                </span>
                            </div>
                            <p className="text-xs text-[#8c7d67] mb-3 font-medium">el de las <span className="font-bold text-[#3c2f20]">{String(proximoCadiz.h).padStart(2, '0')}:{String(proximoCadiz.m).padStart(2, '0')}</span></p>

                            <div className="flex items-baseline justify-between my-3">
                                <div>
                                    <span className="text-4xl sm:text-5xl font-black text-[#2c2416] tracking-tighter font-serif">
                                        {minCadiz}
                                    </span>
                                    <span className="text-base font-bold text-[#6c5d47] ml-1">min</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] text-[#8c7d67] block font-medium">Hora estimada</span>
                                    <span className="text-sm font-black text-[#2c2416]">
                                        {String(proximoCadiz.h).padStart(2, '0')}:{String(proximoCadiz.m).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 my-3">
                                <span className="bg-[#4a3b2c] text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                                    📌 {proximoCadiz.via}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-900">
                                    📍 Posición GPS
                                </span>
                            </div>

                            <p className="text-xs text-[#6c5d47] font-medium mb-4 bg-[#f5efe3] p-3 rounded-xl border border-[#e6decb]/60">
                                {proximoCadiz.tramo}
                            </p>

                            <button 
                                onClick={() => compartirWhatsApp("hacia", proximoCadiz.destino, `${proximoCadiz.h}:${proximoCadiz.m}`, proximoCadiz.tramo)}
                                className="w-full bg-[#dfb15b] hover:bg-[#d09e43] text-[#2c2416] font-bold text-xs py-3.5 px-4 rounded-2xl transition shadow-2xs flex items-center justify-center gap-2"
                            >
                                <span>📤</span> Avisa a quien vaya contigo
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#fdfbf7] rounded-3xl p-8 text-center border border-[#e6decb]">
                            <p className="text-sm font-bold text-[#6c5d47]">No hay más servicios programados hoy hacia Lebrija y Cádiz.</p>
                        </div>
                    )}

                    {/* SECCIÓN DESPUÉS */}
                    {siguientesCadiz.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-sm font-black text-[#3c2f20] uppercase tracking-wider font-serif">Después</h3>
                            <div className="bg-[#fdfbf7] rounded-3xl p-2 shadow-2xs border border-[#e6decb] divide-y divide-[#e6decb]/50">
                                {siguientesCadiz.map((t, idx) => (
                                    <div key={idx} className="py-3 px-3 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-[#2c2416] text-sm font-serif">{String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}</span>
                                            <span className="bg-[#2c2416] text-white px-2 py-0.5 rounded text-[10px] font-bold">MD</span>
                                            <span className="font-bold text-[#3c2f20]">{t.destino}</span>
                                        </div>
                                        <span className="px-3 py-1 rounded-full font-bold text-xs bg-[#e1f3e8] text-[#1e6b36]">{t.estado}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PIE LEGAL */}
            <div className="mt-8 text-center space-y-1 pt-4 border-t border-[#e6decb] text-xs text-[#8c7d67]">
                <p className="font-bold">Fuente oficial: Renfe / Adif</p>
                <p className="text-[10px]">Utrerapp Live · Servicio automatizado con motor de tramos y GPS.</p>
            </div>
        </div>
    );
}