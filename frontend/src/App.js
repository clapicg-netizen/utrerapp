// ==========================================
// SECCIÓN OFICIAL DE CONSO: LA INTELIGENCIA UTRERANA
// ==========================================
function Conso() {
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([
    { remitente: "conso", texto: "¡Ole ahí! Soy Conso, tu asistente. ¿Qué se cuece hoy por Utrera?" }
  ]);

  const enviarMensaje = (textoForzado) => {
    const textoUsuario = textoForzado || mensaje.trim();
    if (!textoUsuario) return;

    const nuevoChat = [...chat, { remitente: "user", texto: textoUsuario }];
    setChat(nuevoChat);
    if (!textoForzado) setMensaje("");

    const textoLower = textoUsuario.toLowerCase();

    // Lógica rápida y limpia de Conso
    setTimeout(() => {
      let respuestaTexto = "¡Ay, jefe! Eso lo miramos ahora mismo en Utrerapp. Pregúntame por las farmacias de guardia o los trenes y te lo doy al vuelo.";
      
      if (textoLower.includes("farmacia") || textoLower.includes("guardia") || textoLower.includes("medicamento")) {
        respuestaTexto = "🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**\n📅 *Jueves, 22 de octubre de 2026*\n\n**Ldo/a. José González Mena**\n📍 Dirección: Avda. Blas Infante, 7\n📞 Teléfono: 954861763\n⏰ Horarios: Turno de Guardia 24 horas";
      } else if (textoLower.includes("tren") || textoLower.includes("renfe") || textoLower.includes("sevilla") || textoLower.includes("cercanias")) {
        respuestaTexto = "🚆 **CERCANÍAS RENFE LÍNEA C1 (Utrera ↔ Sevilla)**\n\n• **Próximas salidas hacia Sevilla:**\n- 12:40 h (Cercanías C1)\n- 13:20 h (Cercanías C1)\n- 13:50 h (Cercanías C1)\n\n📍 **Estación de Utrera:** Plaza de la Estación, s/n";
      }

      setChat(prev => [...prev, { remitente: "conso", texto: respuestaTexto }]);
    }, 100);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 font-sans">
      {/* Logotipo de IA con formas y maneras utreranas */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 p-5 rounded-3xl text-white shadow-xl flex items-center gap-4 border border-rose-800/40">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-950/50 border-2 border-white/20 animate-pulse">
            🤖✨
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-rose-950" title="En línea"></span>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
            Conso <span className="text-xs px-2 py-0.5 bg-rose-800/80 rounded-full font-semibold text-rose-100">IA Utrerana</span>
          </h2>
          <p className="text-xs text-rose-200 mt-0.5 font-medium">Tu asistente, con arte y al pie del cañón.</p>
        </div>
      </div>

      {/* Botones de acceso rápido con acento local */}
      <div className="p-3 flex gap-2 overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm">
        <button 
          onClick={() => enviarMensaje("farmacia de guardia hoy")}
          className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap shadow-sm border border-amber-200 transition flex items-center gap-1.5"
        >
          🏥 Farmacia de guardia
        </button>
        <button 
          onClick={() => enviarMensaje("próximo tren a sevilla")}
          className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap shadow-sm border border-amber-200 transition flex items-center gap-1.5"
        >
          🚆 Tren a Sevilla
        </button>
      </div>

      {/* Caja del chat */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 h-[400px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {chat.map((c, index) => (
            <div key={index} className={`flex ${c.remitente === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-line shadow-sm ${
                c.remitente === "user" 
                  ? "bg-rose-900 text-white rounded-br-none font-medium" 
                  : "bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/70"
              }`}>
                <p>{c.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); enviarMensaje(); }} className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Pregúntale a Conso lo que te plazca..." 
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-900 font-medium"
          />
          <button type="submit" className="px-4 py-2 bg-rose-900 text-white text-xs font-bold rounded-xl hover:bg-rose-950 transition-colors shadow-sm">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}