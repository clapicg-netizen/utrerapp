import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { API, getSessionId } from "@/lib/api";
import { Send, Sparkles, Train, ExternalLink, ArrowRight, Search } from "lucide-react";

const SUGGESTIONS = [
  "¿Qué farmacia está de guardia hoy?",
  "¿Cómo va el tráfico en Trianilla?",
  "Próximo tren de Cercanías a Sevilla",
  "¿Qué obra hay en el Teatro esta semana?",
  "¿Cuándo es la Feria de la Manzanilla?",
];

const RENFE_URL = "https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios";
const DESTINATIONS = [
  { id: "santa-justa", label: "Sevilla Santa Justa", travel: "~35 min", code: "71801" },
  { id: "lora", label: "Lora del Río", travel: "~55 min", code: "71000" },
];
// Renfe Cercanías Sevilla search URL builder — uses their public horarios page.
// Falls back to the main horarios page if the deep-link fails on the user's end.
const buildRenfeSearch = (destId) => {
  const dst = DESTINATIONS.find((d) => d.id === destId);
  // Public search page pre-filtering Sevilla nucleus (51).
  const base = "https://horarios.renfe.com/cer/hjcer310.jsp";
  const params = new URLSearchParams({
    nucleo: "51",
    i: "s",
    cp: "NO",
    o: "71801", // Utrera (Cercanías Sevilla)
    d: dst?.code || "71801",
  });
  return `${base}?${params.toString()}`;
};

function RenfeWidget() {
  const [dest, setDest] = useState("santa-justa");
  const active = DESTINATIONS.find((d) => d.id === dest);
  return (
    <div
      data-testid="conso-renfe-widget"
      className="mt-3 -mb-0.5 rounded-2xl border border-[color:var(--transit)]/25 bg-gradient-to-br from-[#0F2A3F] to-[#1E6091] text-white overflow-hidden shadow-inner"
    >
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/15 grid place-items-center border border-white/20">
          <Train size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/70">
            Cercanías · Línea C-1
          </p>
          <p className="font-display font-bold text-[13px] leading-tight">
            Buscador oficial de Renfe
          </p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/15">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-white/60">Origen</p>
            <p className="font-display font-bold text-sm">Utrera</p>
          </div>
          <ArrowRight size={14} className="text-white/70 shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[9px] uppercase tracking-widest text-white/60">Destino</p>
            <p className="font-display font-bold text-sm truncate">{active?.label}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {DESTINATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDest(d.id)}
              data-testid={`conso-renfe-dest-${d.id}`}
              className={`py-2 rounded-lg text-[11px] font-semibold border ${
                dest === d.id
                  ? "bg-white text-[color:var(--transit)] border-white"
                  : "bg-white/10 text-white/85 border-white/20 hover:bg-white/15"
              }`}
            >
              {d.label}
              <span className="block text-[9px] font-normal opacity-70">{d.travel}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          <a
            href={buildRenfeSearch(dest)}
            target="_blank"
            rel="noreferrer"
            data-testid="conso-renfe-search"
            className="flex-1 py-2.5 rounded-xl bg-[color:var(--secondary)] hover:opacity-90 text-[#1C1917] text-xs font-extrabold inline-flex items-center justify-center gap-1.5"
          >
            <Search size={13} /> Ver próximos trenes
          </a>
          <a
            href={RENFE_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="conso-renfe-official"
            className="px-3 py-2.5 rounded-xl bg-white/15 border border-white/25 text-xs font-semibold inline-flex items-center gap-1"
            title="Página oficial Renfe"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="mt-1.5 text-[10px] text-white/60 leading-snug">
          Datos oficiales en tiempo real · Cercanías Sevilla
        </p>
      </div>
    </div>
  );
}

const RENFE_TRIGGER_RE = /(l[ií]nea\s*c-?1|renfe|cercan[íi]as|buscador\s+directo|santa\s+justa|lora\s+del\s+r[ií]o)/i;

function AssistantContent({ text }) {
  const isRenfe = RENFE_TRIGGER_RE.test(text);
  // Belt-and-braces: also strip any stray renfe.com URL the model might slip in.
  const clean = text.replace(/https?:\/\/(www\.)?renfe\.com\/[^\s)]*/gi, "").trimEnd();
  return (
    <>
      <span>{clean}</span>
      {isRenfe && <RenfeWidget />}
    </>
  );
}

export default function Conso() {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Conso, tu asistente de Utrera. Pregúntame por farmacias, tráfico, transporte, teatro o eventos. ¿En qué te ayudo?",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scRef = useRef(null);
  const sid = getSessionId();

  useEffect(() => {
    scRef.current?.scrollTo({ top: scRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, message: msg }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const p of parts) {
          const line = p.trim();
          if (!line.startsWith("data:")) continue;
          const chunk = line.slice(5).replace(/^\s/, "");
          if (chunk === "[DONE]") continue;
          if (chunk.startsWith("[ERROR]")) {
            setMsgs((m) => {
              const c = [...m];
              c[c.length - 1] = { role: "assistant", content: "Ups, algo se ha atascado. Inténtalo de nuevo en un momento." };
              return c;
            });
            continue;
          }
          setMsgs((m) => {
            const c = [...m];
            c[c.length - 1] = { role: "assistant", content: c[c.length - 1].content + chunk };
            return c;
          });
        }
      }
    } catch (e) {
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: "No he podido conectar. Vuelve a intentarlo, por favor." };
        return c;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell flex flex-col h-screen" data-testid="conso-page">
      <TopBar title="Conso · Asistente de Utrera" back testId="conso-topbar" />

      <div className="mt-3 flex items-center gap-3 px-1">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-[color:var(--terracotta)] text-white grid place-items-center">
            <Sparkles size={20} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background live-dot" />
        </div>
        <div>
          <p className="font-display font-bold text-[15px] leading-tight">Conso</p>
          <p className="text-[11px] text-muted-foreground">En línea · Claude Sonnet 4.6</p>
        </div>
      </div>

      <div
        ref={scRef}
        data-testid="conso-chat-modal"
        className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-3 pb-4"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            data-testid={`chat-msg-${m.role}-${i}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[color:var(--terracotta)] text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md border border-border/60 flex flex-col"
              }`}
            >
              {m.role === "assistant" && m.content ? (
                <AssistantContent text={m.content} />
              ) : m.content || (busy && i === msgs.length - 1 ? (
                <span className="inline-flex gap-1 py-1">
                  <span className="dot w-1.5 h-1.5 bg-current rounded-full inline-block" />
                  <span className="dot w-1.5 h-1.5 bg-current rounded-full inline-block" />
                  <span className="dot w-1.5 h-1.5 bg-current rounded-full inline-block" />
                </span>
              ) : "")}
            </div>
          </div>
        ))}
      </div>

      {msgs.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar" data-testid="conso-suggestions">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              data-testid={`suggestion-${q.slice(0, 12)}`}
              onClick={() => send(q)}
              className="shrink-0 text-xs px-3 py-2 rounded-full bg-muted hover:bg-muted/70 border border-border/60"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        data-testid="conso-form"
        className="sticky bottom-20 mt-2 flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-1.5 py-1.5 shadow-md"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Escribe tu pregunta…"
          data-testid="conso-input"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          data-testid="conso-send"
          className="w-10 h-10 rounded-full bg-[color:var(--terracotta)] hover:bg-[color:var(--terracotta-dark)] text-white grid place-items-center disabled:opacity-50"
        >
          <Send size={17} />
        </button>
      </form>

      <BottomNav />
    </div>
  );
}
