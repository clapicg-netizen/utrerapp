import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { API, getSessionId } from "@/lib/api";
import { Send, Sparkles, Train, ExternalLink } from "lucide-react";

const SUGGESTIONS = [
  "¿Qué farmacia está de guardia hoy?",
  "¿Cómo va el tráfico en Trianilla?",
  "Próximo tren de Cercanías a Sevilla",
  "¿Qué obra hay en el Teatro esta semana?",
  "¿Cuándo es la Feria de la Manzanilla?",
];

const RENFE_URL = "https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios";
// Match https?://renfe.com... variants and any residual //www.renfe.com/... tails,
// optionally preceded by common introducers (aquí:, enlace:, →, [, ()) and whitespace.
const RENFE_TAIL_RE =
  /[\s\n]*[\[(]?\s*(aquí[:.]|enlace[:.]|link[:.]|url[:.]|→\s*|:\s*)?\s*(https?:)?\/\/(www\.)?renfe\.com\/[^\s)\]]*\)?\]?\.?\s*$/i;

function AssistantContent({ text }) {
  const hasRenfe = /renfe\.com/i.test(text);
  const clean = hasRenfe ? text.replace(RENFE_TAIL_RE, "").trimEnd() : text;
  return (
    <>
      <span>{clean}</span>
      {hasRenfe && (
        <a
          href={RENFE_URL}
          target="_blank"
          rel="noreferrer"
          data-testid="conso-renfe-cta"
          className="mt-3 -mb-0.5 w-full py-2.5 rounded-xl bg-[color:var(--transit)] hover:opacity-90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 no-underline"
        >
          <Train size={14} /> Ver horarios oficiales de Renfe Cercanías Sevilla
          <ExternalLink size={12} />
        </a>
      )}
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
