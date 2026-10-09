from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
import asyncio
import re

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
ADMIN_TOKENS = set()

app = FastAPI(title="Utrerapp API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("utrerapp")


# ---------- Models ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class TrafficAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zone: str
    status: Literal['green', 'yellow', 'red']
    message: str
    detail: str = ""
    updated_at: str = Field(default_factory=now_iso)


class Pharmacy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    on_duty_today: bool = False
    is_24h: bool = False
    hours: str = "09:00 - 21:30"


class TheaterShow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    genre: str
    date: str
    time: str
    price: str
    description: str


class TransitLine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kind: Literal['bus', 'renfe']
    line: str
    name: str
    next_departures: List[str]
    frequency: str


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    date: str
    location: str
    description: str
    highlighted: bool = False


class NewsItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str
    headline: str
    summary: str
    category: str
    published_at: str = Field(default_factory=now_iso)
    url: str = "#"


class Anuncio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    municipio: str = "utrera"
    categoria: Literal['compra', 'venta', 'servicio'] = 'venta'
    titulo: str
    precio: str
    descripcion: str
    whatsapp: str
    autor: str = "Vecino/a"
    es_activo: bool = True
    creado: str = Field(default_factory=now_iso)


class Comercio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    categoria: Literal['moda', 'alimentacion', 'deportes', 'hogar'] = 'moda'
    nombre: str
    descripcion: str = ""
    imagen: str = ""
    url: str = "#"
    tag: str = ""
    telefono: str = ""
    direccion: str = ""
    web: str = ""
    menu_pdf_url: str = ""
    oferta_imagen: str = ""
    oferta_titulo: str = ""
    oferta_texto: str = ""
    instagram: str = ""
    facebook: str = ""
    tiktok: str = ""
    fotos: List[str] = Field(default_factory=list)


class Hosteleria(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tipo: Literal['bares', 'restaurantes', 'cafes', 'domicilio'] = 'bares'
    nombre: str
    descripcion: str = ""
    foto: str = ""
    telefono: str
    whatsapp: str = ""
    carta_url: str = "#"
    horario: str = ""
    zona: str = ""
    rating: float = 4.5
    direccion: str = ""
    web: str = ""
    menu_pdf_url: str = ""
    oferta_imagen: str = ""
    oferta_titulo: str = ""
    oferta_texto: str = ""
    instagram: str = ""
    facebook: str = ""
    tiktok: str = ""
    fotos: List[str] = Field(default_factory=list)


class Inmueble(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tipo: Literal['venta', 'alquiler', 'garajes', 'locales'] = 'venta'
    titulo: str
    precio: str
    descripcion: str = ""
    foto: str = ""
    telefono: str = ""
    zona: str = ""
    agencia: str = ""
    dorm: Optional[int] = None
    m2: Optional[int] = None
    url: str = "#"


class TvChannel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    now_playing: str
    next_show: str
    stream_url: str
    live: bool = True


class LoginBody(BaseModel):
    password: str


class ChatBody(BaseModel):
    session_id: str
    message: str


# ---------- Admin auth ----------
def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    if token not in ADMIN_TOKENS:
        raise HTTPException(401, "Invalid token")
    return token


@api.post("/admin/login")
async def admin_login(body: LoginBody):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Contraseña incorrecta")
    token = str(uuid.uuid4())
    ADMIN_TOKENS.add(token)
    return {"token": token}


# ---------- Generic CRUD helper ----------
async def list_docs(coll: str):
    return await db[coll].find({}, {"_id": 0}).to_list(500)


async def upsert_doc(coll: str, doc: dict):
    await db[coll].replace_one({"id": doc["id"]}, doc, upsert=True)
    return doc


async def delete_doc(coll: str, id: str):
    r = await db[coll].delete_one({"id": id})
    return r.deleted_count > 0


# ---------- Traffic ----------
@api.get("/traffic", response_model=List[TrafficAlert])
async def get_traffic():
    return await list_docs("traffic")


@api.post("/traffic", response_model=TrafficAlert)
async def create_traffic(item: TrafficAlert, _=Depends(require_admin)):
    item.updated_at = now_iso()
    return await upsert_doc("traffic", item.model_dump())


@api.delete("/traffic/{id}")
async def del_traffic(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("traffic", id)}


# ---------- Pharmacies ----------
@api.get("/pharmacies", response_model=List[Pharmacy])
async def get_pharmacies():
    return await list_docs("pharmacies")


@api.post("/pharmacies", response_model=Pharmacy)
async def create_pharmacy(item: Pharmacy, _=Depends(require_admin)):
    return await upsert_doc("pharmacies", item.model_dump())


@api.delete("/pharmacies/{id}")
async def del_pharmacy(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("pharmacies", id)}


# ---------- Theater ----------
@api.get("/theater", response_model=List[TheaterShow])
async def get_theater():
    return await list_docs("theater")


@api.post("/theater", response_model=TheaterShow)
async def create_show(item: TheaterShow, _=Depends(require_admin)):
    return await upsert_doc("theater", item.model_dump())


@api.delete("/theater/{id}")
async def del_show(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("theater", id)}


# ---------- Transit ----------
@api.get("/transit", response_model=List[TransitLine])
async def get_transit():
    return await list_docs("transit")


# ---------- Events ----------
@api.get("/events", response_model=List[Event])
async def get_events():
    return await list_docs("events")


@api.post("/events", response_model=Event)
async def create_event(item: Event, _=Depends(require_admin)):
    return await upsert_doc("events", item.model_dump())


@api.delete("/events/{id}")
async def del_event(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("events", id)}


# ---------- News ----------
@api.get("/news", response_model=List[NewsItem])
async def get_news():
    return await list_docs("news")


@api.post("/news", response_model=NewsItem)
async def create_news(item: NewsItem, _=Depends(require_admin)):
    return await upsert_doc("news", item.model_dump())


@api.delete("/news/{id}")
async def del_news(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("news", id)}


# ---------- TV ----------
@api.get("/tv", response_model=List[TvChannel])
async def get_tv():
    return await list_docs("tv")


# ---------- Anuncios locales (Tablón) ----------
@api.get("/anuncios", response_model=List[Anuncio])
async def get_anuncios(categoria: Optional[str] = None):
    q = {"municipio": "utrera", "es_activo": True}
    if categoria:
        q["categoria"] = categoria
    docs = await db.anuncios_locales.find(q, {"_id": 0}).sort("creado", -1).to_list(200)
    return docs


@api.post("/anuncios", response_model=Anuncio)
async def create_anuncio(item: Anuncio):
    item.municipio = "utrera"
    item.creado = now_iso()
    return await upsert_doc("anuncios_locales", item.model_dump())


@api.delete("/anuncios/{id}")
async def del_anuncio(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("anuncios_locales", id)}


@api.get("/anuncios/all", response_model=List[Anuncio])
async def list_all_anuncios(_=Depends(require_admin)):
    """Admin: incluye anuncios inactivos y de cualquier municipio para moderar."""
    return await db.anuncios_locales.find({}, {"_id": 0}).sort("creado", -1).to_list(500)


@api.patch("/anuncios/{id}")
async def patch_anuncio(id: str, body: dict, _=Depends(require_admin)):
    """Admin: edita/aprueba un anuncio."""
    allowed = {"titulo", "precio", "descripcion", "whatsapp", "autor", "categoria", "es_activo"}
    upd = {k: v for k, v in body.items() if k in allowed}
    if not upd:
        raise HTTPException(400, "Nada que actualizar")
    r = await db.anuncios_locales.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "No existe")
    return {"updated": True}


# ---------- Comercios (Utrera Market) ----------
@api.get("/comercios", response_model=List[Comercio])
async def get_comercios(categoria: Optional[str] = None):
    q = {"categoria": categoria} if categoria else {}
    return await db.comercios.find(q, {"_id": 0}).to_list(500)


@api.post("/comercios", response_model=Comercio)
async def create_comercio(item: Comercio, _=Depends(require_admin)):
    return await upsert_doc("comercios", item.model_dump())


@api.delete("/comercios/{id}")
async def del_comercio(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("comercios", id)}


# ---------- Hostelería (Utrera Bares & Tapas) ----------
@api.get("/hosteleria", response_model=List[Hosteleria])
async def get_hosteleria(tipo: Optional[str] = None):
    q = {"tipo": tipo} if tipo else {}
    return await db.hosteleria.find(q, {"_id": 0}).to_list(500)


@api.post("/hosteleria", response_model=Hosteleria)
async def create_hosteleria(item: Hosteleria, _=Depends(require_admin)):
    return await upsert_doc("hosteleria", item.model_dump())


@api.delete("/hosteleria/{id}")
async def del_hosteleria(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("hosteleria", id)}


# ---------- Inmuebles (Utrera Vivienda) ----------
@api.get("/inmuebles", response_model=List[Inmueble])
async def get_inmuebles(tipo: Optional[str] = None):
    q = {"tipo": tipo} if tipo else {}
    return await db.inmuebles.find(q, {"_id": 0}).to_list(500)


@api.post("/inmuebles", response_model=Inmueble)
async def create_inmueble(item: Inmueble, _=Depends(require_admin)):
    return await upsert_doc("inmuebles", item.model_dump())


@api.delete("/inmuebles/{id}")
async def del_inmueble(id: str, _=Depends(require_admin)):
    return {"deleted": await delete_doc("inmuebles", id)}




# ---------- Conso Chat (streaming) ----------
CONSO_SYSTEM = (
    "Eres Conso, el asistente virtual oficial de Utrerapp, la app de servicios locales "
    "de Utrera (Sevilla, España). Respondes SIEMPRE en español, con tono cercano, "
    "cálido y andaluz pero profesional. Ayudas con: farmacias de guardia, tráfico "
    "en Trianilla/Salesianos/Centro, horarios de autobuses urbanos y Cercanías Renfe C1, "
    "eventos y fiestas (Feria de la Manzanilla, Potaje Gitano, Semana Santa utrerana), "
    "Teatro Enrique de la Cuadra, noticias locales y trámites. Si no sabes algo con "
    "certeza, dilo con honestidad y sugiere dónde consultar. Sé conciso: máximo 4-5 "
    "frases salvo que pidan detalle. Nunca inventes teléfonos ni direcciones exactas.\n\n"
    "== BASE DE CONOCIMIENTO: RENFE CERCANÍAS DE UTRERA ==\n"
    "Línea C-1: Utrera ↔ Sevilla Santa Justa ↔ Lora del Río.\n"
    "También existe la Línea C-3 (Utrera ↔ Cazalla-Constantina).\n\n"
    "== REGLA CRÍTICA: TRENES / RENFE / CERCANÍAS ==\n"
    "IMPORTANTE: la aplicación intercepta automáticamente estas consultas y "
    "responde con datos calculados en el servidor. Si por cualquier motivo "
    "recibes una consulta sobre trenes/renfe/cercanías, respondes con UNA "
    "sola frase pidiendo disculpas y sugiriendo reformular. NUNCA des "
    "frecuencias, rangos horarios, URLs, ni enlaces externos.\n\n"
    "== BASE DE CONOCIMIENTO: URGENCIAS Y SALUD EN UTRERA (MÁXIMA PRIORIDAD) ==\n"
    "1) URGENCIAS MÉDICAS 24h — Hospital de referencia:\n"
    "   • **CHARE de Utrera** (Centro Hospitalario de Alta Resolución).\n"
    "   • Es el centro PRINCIPAL para urgencias hospitalarias y atención "
    "especializada del municipio.\n"
    "   • Dirección: Carretera de Los Palacios, km 3,4 · 41710 Utrera.\n"
    "   • Teléfono directo del CHARE: 955 839 400.\n"
    "   • Urgencias hospitalarias abiertas 24 horas.\n"
    "2) ATENCIÓN PRIMARIA Y CITAS:\n"
    "   • **Centro de Salud Utrera Norte** — C/ Menéndez Pelayo, s/n · Tel. 955 839 500.\n"
    "   • **Centro de Salud Utrera Sur** — Av. de Los Cronistas, s/n · Tel. 955 839 520.\n"
    "   • Horario habitual: L-V 08:00-21:00. Urgencias de primaria 24h.\n"
    "   • Para pedir cita: Salud Responde 955 545 060 o app 'Salud Andalucía'.\n"
    "3) TELÉFONOS DE EMERGENCIA DIRECTOS (recuérdalos SIEMPRE que sea pertinente):\n"
    "   • **112** — Emergencias generales (bomberos, policía y sanitario).\n"
    "   • **061** — Urgencias sanitarias / ambulancia (SAS Andalucía).\n"
    "   • **CHARE Utrera** — 955 839 400 (para info hospitalaria, no para "
    "emergencia vital: en ese caso, 112).\n"
    "   • Policía Local de Utrera: 955 860 808 · Bomberos Utrera: 955 861 992.\n"
    "4) FARMACIAS DE GUARDIA:\n"
    "   • Al INICIO de cada conversación recibirás un bloque '== FARMACIA DE "
    "GUARDIA HOY (DATO EN VIVO) ==' con el registro activo leído de la base "
    "de datos oficial del Colegio de Farmacéuticos vía Utrerapp.\n"
    "   • Cuando el usuario pregunte por la farmacia de guardia, RESPONDE "
    "SIEMPRE con los datos exactos de ese bloque (nombre, dirección, teléfono "
    "y horario) — no inventes ni digas que no lo sabes.\n"
    "   • Si el bloque indica que NO hay farmacia de guardia activa, entonces "
    "sí remite al usuario a la sección 'Farmacias de Guardia' de la app o al "
    "Colegio Oficial de Farmacéuticos de Sevilla.\n\n"
    "== REGLA OBLIGATORIA PARA CONSULTAS DE URGENCIAS / SALUD / MÉDICO ==\n"
    "Cuando el usuario pregunte por urgencias, médico, hospital, ambulancia, "
    "centro de salud, cita médica o farmacia de guardia: (1) si describe un "
    "posible riesgo vital, indica en primera línea llamar al **112** de inmediato; "
    "(2) para urgencias hospitalarias no vitales, dirige al **CHARE de Utrera** "
    "con su teléfono 955 839 400; (3) para consultas rutinarias o cita, dirige "
    "al Centro de Salud Utrera Norte o Sur según convenga; (4) para saber la "
    "farmacia de guardia del día, remite a la sección 'Farmacias' de Utrerapp."
)


# ---------- Renfe Cercanías C-1 timetable (Utrera northbound) ----------
# Public schedule of línea C-1 Utrera → Sevilla Santa Justa → Lora del Río.
# Times are in Europe/Madrid local time. Kept in-server for zero-dependency,
# deterministic answers (no external calls at request time).
TIMETABLE_C1_WEEKDAY = [
    "05:34", "06:04", "06:34", "07:04", "07:34", "07:52", "08:04", "08:22",
    "08:34", "08:52", "09:04", "09:22", "09:34", "09:52", "10:04", "10:34",
    "11:04", "11:34", "12:04", "12:34", "13:04", "13:34", "14:04", "14:34",
    "15:04", "15:34", "16:04", "16:22", "16:34", "16:52", "17:04", "17:22",
    "17:34", "17:52", "18:04", "18:22", "18:34", "18:52", "19:04", "19:22",
    "19:34", "19:52", "20:04", "20:34", "21:04", "21:34", "22:04", "22:34",
]
TIMETABLE_C1_WEEKEND = [
    "06:06", "07:06", "08:06", "09:06", "10:06", "11:06", "12:06", "13:06",
    "14:06", "15:06", "16:06", "17:06", "18:06", "19:06", "20:06", "21:06",
    "22:06",
]

MADRID_TZ = ZoneInfo("Europe/Madrid")
TRAIN_INTENT_RE = re.compile(
    r"\b(tren|trenes|cercan[íi]as|renfe|c-?1|santa\s*justa|sevilla|lora)\b",
    re.IGNORECASE,
)


def _table_for(now_madrid: datetime) -> List[str]:
    # 0=Mon .. 6=Sun. Weekend = Sat/Sun.
    return TIMETABLE_C1_WEEKEND if now_madrid.weekday() >= 5 else TIMETABLE_C1_WEEKDAY


def next_c1_departures(n: int = 3) -> dict:
    now = datetime.now(MADRID_TZ)
    hhmm_now = now.strftime("%H:%M")
    table = _table_for(now)
    upcoming = [t for t in table if t > hhmm_now]
    return {
        "server_time": now.strftime("%Y-%m-%d %H:%M"),
        "day_type": "laborable" if now.weekday() < 5 else "fin de semana",
        "next": upcoming[:n],
        "first_tomorrow": table[0] if not upcoming else None,
    }


def format_next_departures_text(dest_label: str) -> str:
    data = next_c1_departures(3)
    times = data["next"]
    if not times:
        return (
            f"Ya no salen más trenes hoy hacia {dest_label}. "
            f"El primero de mañana sale a las {data['first_tomorrow']}."
        )
    if len(times) == 1:
        return f"Próximo tren a {dest_label}: {times[0]}."
    if len(times) == 2:
        return f"Próximos trenes a {dest_label}: {times[0]} y {times[1]}."
    return (
        f"Próximos trenes a {dest_label}: "
        f"{times[0]}, {times[1]} y {times[2]}."
    )


def resolve_train_destination(message: str) -> str:
    m = message.lower()
    if "lora" in m:
        return "Lora del Río"
    return "Sevilla"


@api.get("/renfe/next")
async def renfe_next(destino: str = "sevilla", n: int = 3):
    dest_label = "Lora del Río" if destino.lower().startswith("lora") else "Sevilla"
    data = next_c1_departures(n)
    return {
        "destino": dest_label,
        "server_time": data["server_time"],
        "day_type": data["day_type"],
        "next": data["next"],
        "text": format_next_departures_text(dest_label),
    }


@api.get("/renfe-c1")
async def renfe_c1_full():
    """Cuadrante horario completo de la Línea C-1 Utrera → Sevilla / Lora del Río."""
    now = datetime.now(MADRID_TZ)
    return {
        "line": "C-1",
        "route": "Utrera ↔ Sevilla Santa Justa ↔ Lora del Río",
        "server_time": now.strftime("%Y-%m-%d %H:%M"),
        "day_type": "laborable" if now.weekday() < 5 else "fin de semana",
        "timetable": {
            "weekday": TIMETABLE_C1_WEEKDAY,
            "weekend_holiday": TIMETABLE_C1_WEEKEND,
        },
        "next_from_utrera": next_c1_departures(3)["next"],
    }


# ---------- Teatro / Cultura ----------
THEATER_INTENT_RE = re.compile(
    r"\b(teatro|obra|obras|cartelera|espect[aá]culo|espect[aá]culos|"
    r"evento|eventos|cultura|cultural|feria|fiesta|fiestas|agenda|"
    r"actividad|actividades|conciert|flamenco|potaje)\b",
    re.IGNORECASE,
)


def _fmt_date_es(iso_date: str) -> str:
    """YYYY-MM-DD → 'DD/MM/YYYY (día_semana)'."""
    try:
        d = datetime.strptime(iso_date[:10], "%Y-%m-%d")
    except (ValueError, TypeError):
        return iso_date
    dias = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
    return f"{d.strftime('%d/%m/%Y')} ({dias[d.weekday()]})"


async def get_upcoming_cultura(limit: int = 6) -> List[dict]:
    """Combina obras de teatro + eventos culturales futuros ordenados por fecha."""
    today_iso = datetime.now(MADRID_TZ).strftime("%Y-%m-%d")
    shows = await db.theater.find(
        {"date": {"$gte": today_iso}}, {"_id": 0}
    ).sort("date", 1).to_list(50)
    events = await db.events.find(
        {"date": {"$gte": today_iso}}, {"_id": 0}
    ).sort("date", 1).to_list(50)

    items = []
    for s in shows:
        items.append({
            "kind": "teatro",
            "title": s.get("title"),
            "date": s.get("date"),
            "time": s.get("time", ""),
            "location": "Teatro Enrique de la Cuadra",
            "extra": s.get("genre", ""),
        })
    for e in events:
        items.append({
            "kind": "evento",
            "title": e.get("title"),
            "date": e.get("date"),
            "time": "",
            "location": e.get("location", ""),
            "extra": e.get("category", ""),
        })
    items.sort(key=lambda x: x["date"])
    return items[:limit]


def format_cultura_text(items: List[dict]) -> str:
    if not items:
        return (
            "Ahora mismo no tengo ninguna obra ni evento cultural registrado "
            "en la agenda de Utrera. Vuelve a preguntar en unos días."
        )
    lines = ["Próximas obras y eventos culturales en Utrera:"]
    for it in items:
        date_es = _fmt_date_es(it["date"])
        hora = f" · {it['time']}" if it["time"] else ""
        loc = f" — {it['location']}" if it["location"] else ""
        etiqueta = "🎭" if it["kind"] == "teatro" else "🎉"
        lines.append(f"{etiqueta} {it['title']} — {date_es}{hora}{loc}")
    return "\n".join(lines)


@api.get("/teatro")
async def teatro_endpoint(limit: int = 6):
    items = await get_upcoming_cultura(limit)
    return {
        "count": len(items),
        "server_time": datetime.now(MADRID_TZ).strftime("%Y-%m-%d %H:%M"),
        "items": items,
        "text": format_cultura_text(items),
    }


async def build_live_context() -> str:
    """Live data injected into Conso system prompt on every chat request."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    duty = await db.pharmacies.find_one(
        {"on_duty_today": True}, {"_id": 0}
    )
    if duty:
        farmacia_block = (
            f"== FARMACIA DE GUARDIA HOY (DATO EN VIVO · {today}) ==\n"
            f"Nombre: {duty.get('name', 'N/D')}\n"
            f"Dirección: {duty.get('address', 'N/D')} (Utrera)\n"
            f"Teléfono: {duty.get('phone', 'N/D')}\n"
            f"Horario: {duty.get('hours', 'N/D')}\n"
            f"Estado 24h: {'sí' if duty.get('is_24h') else 'no'}\n"
            "Usa estos datos EXACTOS cuando el usuario pregunte por la "
            "farmacia de guardia. No los inventes ni los alteres.\n"
        )
    else:
        farmacia_block = (
            f"== FARMACIA DE GUARDIA HOY (DATO EN VIVO · {today}) ==\n"
            "No hay ninguna farmacia marcada como de guardia en la base de "
            "datos. Remite al usuario a la sección 'Farmacias de Guardia' de "
            "Utrerapp o al Colegio Oficial de Farmacéuticos de Sevilla.\n"
        )
    return farmacia_block


@api.post("/chat/stream")
async def chat_stream(body: ChatBody):
    # Intercept train/Renfe queries — respond deterministically with real
    # next departures from the local C-1 timetable, no LLM involved.
    if TRAIN_INTENT_RE.search(body.message or ""):
        dest = resolve_train_destination(body.message)
        answer = format_next_departures_text(dest)

        async def gen_train():
            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "user",
                "content": body.message,
                "ts": now_iso(),
            })
            yield f"data: {answer}\n\n"
            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "assistant",
                "content": answer,
                "ts": now_iso(),
            })
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            gen_train(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # Intercept theater / cultural queries — read from DB, respond in plain text,
    # never redirect the user outside the app.
    if THEATER_INTENT_RE.search(body.message or ""):
        items = await get_upcoming_cultura(6)
        answer = format_cultura_text(items)

        async def gen_cultura():
            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "user",
                "content": body.message,
                "ts": now_iso(),
            })
            # Stream line by line for a natural typing effect
            for line in answer.split("\n"):
                yield f"data: {line}\n\n"
                yield "data: \n\n\n"
                await asyncio.sleep(0.02)
            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "assistant",
                "content": answer,
                "ts": now_iso(),
            })
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            gen_cultura(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    live_ctx = await build_live_context()
    system_full = CONSO_SYSTEM + "\n\n" + live_ctx

    async def gen():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=body.session_id,
                system_message=system_full,
            ).with_model("anthropic", "claude-sonnet-4-6")

            # persist user message
            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "user",
                "content": body.message,
                "ts": now_iso(),
            })

            full = []
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    yield f"data: {ev.content}\n\n"
                    await asyncio.sleep(0)
                elif isinstance(ev, StreamDone):
                    break

            await db.chat_messages.insert_one({
                "session_id": body.session_id,
                "role": "assistant",
                "content": "".join(full),
                "ts": now_iso(),
            })
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("chat stream error")
            yield f"data: [ERROR] {str(e)[:200]}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@api.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    msgs = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("ts", 1).to_list(200)
    return msgs


# ---------- Seed ----------
SEED_TRAFFIC = [
    {"id": "t-trianilla", "zone": "Trianilla", "status": "yellow",
     "message": "Obras en marcha - Retenciones cortas",
     "detail": "Obras de renovación de acerado en Avenida de la Trianilla. Se recomienda desviarse por Avenida de María Auxiliadora.",
     "updated_at": now_iso()},
    {"id": "t-salesianos", "zone": "Salesianos", "status": "green",
     "message": "Tráfico fluido en rotonda",
     "detail": "La rotonda de Salesianos presenta circulación normal en ambos sentidos.",
     "updated_at": now_iso()},
    {"id": "t-centro", "zone": "Centro Histórico", "status": "red",
     "message": "Acceso restringido solo a residentes",
     "detail": "Corte total al tráfico no residente en calle Ancha y Plaza del Altozano hasta las 22:00.",
     "updated_at": now_iso()},
]

SEED_PHARMACIES = [
    {"id": "p-1", "name": "Farmacia Ldo. Rodríguez Pérez", "address": "C/ Ancha, 34",
     "phone": "955 861 234", "on_duty_today": True, "is_24h": False, "hours": "09:00 - 22:00 (Guardia)"},
    {"id": "p-2", "name": "Farmacia Nuestra Señora de Consolación", "address": "Av. de Sevilla, 12",
     "phone": "955 862 550", "on_duty_today": False, "is_24h": False, "hours": "09:30 - 14:00 / 17:00 - 21:00"},
    {"id": "p-3", "name": "Farmacia Trianilla", "address": "C/ Trianilla, 88",
     "phone": "955 864 010", "on_duty_today": False, "is_24h": True, "hours": "Abierta 24 horas"},
    {"id": "p-4", "name": "Farmacia Plaza del Altozano", "address": "Pl. del Altozano, 3",
     "phone": "955 861 992", "on_duty_today": False, "is_24h": False, "hours": "09:00 - 21:30"},
]

SEED_THEATER = [
    {"id": "s-1", "title": "Bodas de Sangre", "genre": "Teatro clásico", "date": "2026-02-22",
     "time": "20:30", "price": "12€ - 18€",
     "description": "Adaptación de la obra de Federico García Lorca por la compañía Sevillana Teatro Vivo."},
    {"id": "s-2", "title": "Flamenco en la Cuadra", "genre": "Flamenco", "date": "2026-03-01",
     "time": "21:00", "price": "15€",
     "description": "Noche flamenca con Miguel Vargas y Rocío Márquez, cantaora utrerana."},
    {"id": "s-3", "title": "El Rey León (musical infantil)", "genre": "Familiar", "date": "2026-03-08",
     "time": "18:00", "price": "8€",
     "description": "Espectáculo musical para toda la familia, con más de 20 actores en escena."},
]

SEED_TRANSIT = [
    {"id": "l1", "kind": "bus", "line": "L1", "name": "Circular Norte",
     "next_departures": ["14:05", "14:25", "14:45"], "frequency": "Cada 20 min"},
    {"id": "l2", "kind": "bus", "line": "L2", "name": "Estación - Centro - Hospital",
     "next_departures": ["14:10", "14:40", "15:10"], "frequency": "Cada 30 min"},
    {"id": "c1", "kind": "renfe", "line": "C1", "name": "Cercanías Utrera ↔ Sevilla Santa Justa",
     "next_departures": ["14:12", "14:42", "15:12"], "frequency": "Cada 30 min"},
    {"id": "c3", "kind": "renfe", "line": "C3", "name": "Cercanías Utrera ↔ Cazalla-Constantina",
     "next_departures": ["15:35", "17:35", "19:35"], "frequency": "Cada 2h"},
]

SEED_EVENTS = [
    {"id": "e-1", "title": "Feria de la Manzanilla de Utrera", "category": "Fiestas",
     "date": "2026-03-14", "location": "Recinto ferial El Tinte",
     "description": "Fiesta declarada de Interés Turístico Nacional de Andalucía. Casetas, caballos y flamenco.",
     "highlighted": True},
    {"id": "e-2", "title": "Potaje Gitano de Utrera", "category": "Flamenco",
     "date": "2026-06-27", "location": "Plaza del Altozano",
     "description": "El festival flamenco más antiguo del mundo. 68ª edición.",
     "highlighted": True},
    {"id": "e-3", "title": "Semana Santa Utrerana", "category": "Tradición",
     "date": "2026-03-29", "location": "Casco histórico",
     "description": "Procesiones de las hermandades utreranas por el itinerario oficial.",
     "highlighted": True},
    {"id": "e-4", "title": "Mercado Ecológico de Utrera", "category": "Mercados",
     "date": "2026-02-15", "location": "Parque Consolación",
     "description": "Productores locales de aceite, queso y hortalizas.",
     "highlighted": False},
    {"id": "e-5", "title": "Ruta Guiada Utrera Monumental", "category": "Cultura",
     "date": "2026-02-20", "location": "Oficina de Turismo",
     "description": "Recorrido por Castillo, Iglesia de Santiago y Plaza del Altozano.",
     "highlighted": False},
]

SEED_NEWS = [
    {"id": "n-1", "source": "Utrera al Día", "headline": "El Ayuntamiento aprueba nuevo plan de peatonalización del centro",
     "summary": "El pleno municipal ha dado luz verde por unanimidad al proyecto que peatonalizará calle Ancha antes del verano.",
     "category": "Política", "published_at": now_iso(), "url": "#"},
    {"id": "n-2", "source": "Utrera Información", "headline": "Récord de visitantes en el Potaje Gitano 2026",
     "summary": "Más de 4.500 asistentes convirtieron la 67ª edición en la más multitudinaria de su historia.",
     "category": "Cultura", "published_at": now_iso(), "url": "#"},
    {"id": "n-3", "source": "Diario de Utrera", "headline": "Renfe reforzará la línea C1 con dos trenes más los fines de semana",
     "summary": "La medida entrará en vigor el próximo 1 de marzo tras las peticiones vecinales.",
     "category": "Transporte", "published_at": now_iso(), "url": "#"},
    {"id": "n-4", "source": "Utrera al Día", "headline": "El Betis Utrerano asciende a Tercera División",
     "summary": "Victoria clave 2-0 frente al Coria CF en un Estadio San Juan Bosco lleno.",
     "category": "Deportes", "published_at": now_iso(), "url": "#"},
    {"id": "n-5", "source": "Sevilla Este", "headline": "Nuevo brote de gripe estacional obliga a reforzar las farmacias de guardia",
     "summary": "El Colegio de Farmacéuticos amplía el turno de guardia nocturna en Utrera durante febrero.",
     "category": "Salud", "published_at": now_iso(), "url": "#"},
]

SEED_TV = [
    {"id": "tv-1", "name": "Utrera TV", "now_playing": "Informativo Utrera 14h",
     "next_show": "Flamenco desde El Altozano · 15:30",
     "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", "live": True},
    {"id": "tv-2", "name": "Utrera Cultura", "now_playing": "Documental: Historia del Potaje Gitano",
     "next_show": "Entrevista: Bartolomé Miguel Miguel · 16:00",
     "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", "live": True},
]

SEED_ANUNCIOS = [
    {"id": "a-1", "municipio": "utrera", "categoria": "venta",
     "titulo": "Bicicleta de montaña Orbea 27,5\"",
     "precio": "180€", "descripcion": "Usada un año, cambio Shimano 21v, en muy buen estado. Recoger en Trianilla.",
     "whatsapp": "34655123456", "autor": "Manolo R.", "es_activo": True, "creado": now_iso()},
    {"id": "a-2", "municipio": "utrera", "categoria": "servicio",
     "titulo": "Clases particulares de matemáticas ESO y Bach.",
     "precio": "12€/h", "descripcion": "Profesora titulada, zona Salesianos. Refuerzo y preparación de exámenes.",
     "whatsapp": "34677234567", "autor": "Rocío M.", "es_activo": True, "creado": now_iso()},
    {"id": "a-3", "municipio": "utrera", "categoria": "venta",
     "titulo": "Sofá 3 plazas gris antracita",
     "precio": "120€", "descripcion": "Muy cómodo, se entrega en Utrera por 10€ extra. Medidas 210x90.",
     "whatsapp": "34612345678", "autor": "Carmen S.", "es_activo": True, "creado": now_iso()},
    {"id": "a-4", "municipio": "utrera", "categoria": "compra",
     "titulo": "Busco PlayStation 4 en buen estado",
     "precio": "Hasta 120€", "descripcion": "Interesa con al menos un mando y algún juego. Pago al momento.",
     "whatsapp": "34699888777", "autor": "David P.", "es_activo": True, "creado": now_iso()},
    {"id": "a-5", "municipio": "utrera", "categoria": "servicio",
     "titulo": "Reformas y albañilería · presupuesto sin compromiso",
     "precio": "Consultar", "descripcion": "Alicatados, pintura, pladur. Trabajos en Utrera y comarca. 20 años de experiencia.",
     "whatsapp": "34633445566", "autor": "Reformas Alcántara", "es_activo": True, "creado": now_iso()},
    {"id": "a-6", "municipio": "utrera", "categoria": "venta",
     "titulo": "Silla de paseo Chicco casi nueva",
     "precio": "60€", "descripcion": "Con capota y bolso. Solo 4 meses de uso.", 
     "whatsapp": "34655998877", "autor": "Marta G.", "es_activo": True, "creado": now_iso()},
]

SEED_COMERCIOS = [
    {"id": "c-moda-1", "categoria": "moda", "nombre": "Boutique Trianilla", "descripcion": "Moda mujer y complementos artesanos.", "imagen": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=Boutique+Trianilla+Utrera", "tag": "Envío gratis > 30€"},
    {"id": "c-moda-2", "categoria": "moda", "nombre": "Zapatería Utrera Kids", "descripcion": "Calzado infantil y comuniones.", "imagen": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=zapateria+utrera+kids", "tag": "Novedad"},
    {"id": "c-moda-3", "categoria": "moda", "nombre": "El Rincón Flamenco", "descripcion": "Trajes de flamenca y complementos de feria.", "imagen": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=el+rincon+flamenco+utrera", "tag": ""},
    {"id": "c-ali-1", "categoria": "alimentacion", "nombre": "Aceite Utrera Verde", "descripcion": "AOVE del Corbones directo del molino.", "imagen": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=aceite+utrera+verde", "tag": "Local"},
    {"id": "c-ali-2", "categoria": "alimentacion", "nombre": "Mostachones El Altozano", "descripcion": "Mostachones y bollería tradicional envío 24h.", "imagen": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=mostachones+utrera", "tag": ""},
    {"id": "c-ali-3", "categoria": "alimentacion", "nombre": "Bodega Salado", "descripcion": "Vinos, manzanilla y jamón ibérico.", "imagen": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=bodega+salado+utrera", "tag": ""},
    {"id": "c-dep-1", "categoria": "deportes", "nombre": "Deportes Utrera Sport", "descripcion": "Fútbol, running y padel. Recogida en tienda.", "imagen": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=deportes+utrera+sport", "tag": ""},
    {"id": "c-dep-2", "categoria": "deportes", "nombre": "Ciclos El Palmar", "descripcion": "Bicis eléctricas y montaña. Servicio taller.", "imagen": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=ciclos+el+palmar+utrera", "tag": "Taller propio"},
    {"id": "c-hog-1", "categoria": "hogar", "nombre": "Muebles Consolación", "descripcion": "Muebles a medida y decoración.", "imagen": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=muebles+consolacion+utrera", "tag": ""},
    {"id": "c-hog-2", "categoria": "hogar", "nombre": "Electrodomésticos Vega", "descripcion": "Instalación gratuita en Utrera y comarca.", "imagen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=electrodomesticos+vega+utrera", "tag": "Instalación"},
    {"id": "c-hog-3", "categoria": "hogar", "nombre": "Ferretería La Manzanilla", "descripcion": "Bricolaje y jardín. Envío al día.", "imagen": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=70", "url": "https://google.com/search?q=ferreteria+la+manzanilla+utrera", "tag": ""},
]

SEED_HOSTELERIA = [
    {"id": "h-bar-1", "tipo": "bares", "nombre": "Bar Casa Manolo", "descripcion": "El clásico utrerano. Tapas de guiso, montaditos y su famoso solomillo al whisky.", "foto": "https://images.unsplash.com/photo-1546195643-70f48f9c5b87?auto=format&fit=crop&w=800&q=75", "telefono": "955861010", "whatsapp": "34655700001", "carta_url": "https://google.com/search?q=bar+casa+manolo+utrera+carta", "horario": "L-D · 12:00-16:30 y 19:30-00:00", "zona": "C/ Ancha, 22", "rating": 4.7},
    {"id": "h-bar-2", "tipo": "bares", "nombre": "Taberna El Altozano", "descripcion": "Vinos de la tierra, jamón de bellota y quesos artesanos.", "foto": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=75", "telefono": "955862345", "whatsapp": "34655700002", "carta_url": "https://google.com/search?q=taberna+altozano+utrera", "horario": "Ma-D · 12:30-16:00 y 20:00-00:30", "zona": "Pl. del Altozano, 4", "rating": 4.6},
    {"id": "h-bar-3", "tipo": "bares", "nombre": "Bar Los Tarantos", "descripcion": "Tapas flamencas, caracoles y pescaíto frito.", "foto": "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=75", "telefono": "955864455", "whatsapp": "34655700003", "carta_url": "https://google.com/search?q=bar+los+tarantos+utrera", "horario": "Mi-D · 13:00-16:00 y 20:00-01:00", "zona": "C/ Trianilla, 12", "rating": 4.8},
    {"id": "h-res-1", "tipo": "restaurantes", "nombre": "Restaurante Consolación", "descripcion": "Cocina andaluza actualizada. Menú del día 14€.", "foto": "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=75", "telefono": "955867788", "whatsapp": "34655700004", "carta_url": "https://google.com/search?q=restaurante+consolacion+utrera+carta", "horario": "L-Sa · 13:30-16:00 y 21:00-23:30", "zona": "Av. de Sevilla, 41", "rating": 4.5},
    {"id": "h-res-2", "tipo": "restaurantes", "nombre": "El Corral de la Manzanilla", "descripcion": "Arroces caldosos y carnes a la brasa.", "foto": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=75", "telefono": "955868899", "whatsapp": "34655700005", "carta_url": "https://google.com/search?q=corral+manzanilla+utrera", "horario": "Ma-D · 13:00-17:00 y 20:30-00:00", "zona": "Carretera A-364, km 2", "rating": 4.6},
    {"id": "h-res-3", "tipo": "restaurantes", "nombre": "La Cocina de Rocío", "descripcion": "Cocina de mercado con toques modernos.", "foto": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=75", "telefono": "955869900", "whatsapp": "34655700006", "carta_url": "https://google.com/search?q=la+cocina+de+rocio+utrera", "horario": "Ju-D · 13:30-16:00 y 20:30-23:30", "zona": "C/ Rodrigo Caro, 8", "rating": 4.9},
    {"id": "h-caf-1", "tipo": "cafes", "nombre": "Café Central Utrera", "descripcion": "Desayunos molletes, tostadas de aceite y repostería casera.", "foto": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=75", "telefono": "955861133", "whatsapp": "34655700007", "carta_url": "https://google.com/search?q=cafe+central+utrera", "horario": "L-D · 07:30-22:00", "zona": "Pl. del Altozano, 12", "rating": 4.4},
    {"id": "h-caf-2", "tipo": "cafes", "nombre": "Gin Bar Malamadre", "descripcion": "Coctelería de autor y ginebras premium.", "foto": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=75", "telefono": "955862211", "whatsapp": "34655700008", "carta_url": "https://google.com/search?q=gin+bar+malamadre+utrera", "horario": "Ju-Sa · 20:00-03:00", "zona": "C/ Sevilla, 8", "rating": 4.7},
    {"id": "h-dom-1", "tipo": "domicilio", "nombre": "Pizzería La Manzanilla", "descripcion": "Pizzas artesanas horno de leña. Envío en 30 min.", "foto": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=75", "telefono": "955867700", "whatsapp": "34655700009", "carta_url": "https://google.com/search?q=pizzeria+la+manzanilla+utrera", "horario": "Ma-D · 19:30-23:30", "zona": "C/ Salesianos, 33 · Envío 2€", "rating": 4.6},
    {"id": "h-dom-2", "tipo": "domicilio", "nombre": "Sushi Utrera Roll", "descripcion": "Sushi y makis para llevar o a domicilio. 20% dto. martes.", "foto": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=75", "telefono": "955868811", "whatsapp": "34655700010", "carta_url": "https://google.com/search?q=sushi+utrera+roll", "horario": "Ma-D · 13:30-16:00 y 20:30-23:30", "zona": "Av. María Auxiliadora, 14", "rating": 4.8},
    {"id": "h-dom-3", "tipo": "domicilio", "nombre": "Kebab Utrera Express", "descripcion": "Kebabs, durums y hamburguesas. Reparto en 20 min.", "foto": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=75", "telefono": "955869922", "whatsapp": "34655700011", "carta_url": "https://google.com/search?q=kebab+utrera+express", "horario": "Todos los días · 12:00-01:00", "zona": "C/ Álvarez Quintero, 5", "rating": 4.3},
]

SEED_INMUEBLES = [
    {"id": "i-v-1", "tipo": "venta", "titulo": "Piso 3 dorm. junto al Altozano", "zona": "Centro", "precio": "148.000€", "dorm": 3, "m2": 92, "agencia": "Inmobiliaria Utrera Centro", "telefono": "955860100", "descripcion": "Reformado en 2023, orientación sur. A 200m de la plaza del Altozano.", "foto": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=piso+venta+utrera+altozano"},
    {"id": "i-v-2", "tipo": "venta", "titulo": "Chalet adosado con piscina", "zona": "Salesianos", "precio": "245.000€", "dorm": 4, "m2": 180, "agencia": "Ficasa Utrera", "telefono": "955860200", "descripcion": "Con jardín, garaje y piscina comunitaria. 3 baños.", "foto": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=chalet+adosado+utrera"},
    {"id": "i-v-3", "tipo": "venta", "titulo": "Casa histórica rehabilitada", "zona": "Casco Antiguo", "precio": "195.000€", "dorm": 3, "m2": 140, "agencia": "Alcántara Fincas", "telefono": "955860300", "descripcion": "Patio andaluz, techos altos y cocina nueva.", "foto": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=casa+historica+utrera"},
    {"id": "i-a-1", "tipo": "alquiler", "titulo": "Ático amueblado con terraza", "zona": "Trianilla", "precio": "650€/mes", "dorm": 2, "m2": 78, "agencia": "Grupo Consolación", "telefono": "955860400", "descripcion": "Terraza de 20m² con vistas al Castillo. Amueblado.", "foto": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+atico+utrera"},
    {"id": "i-a-2", "tipo": "alquiler", "titulo": "Piso económico cerca de la estación", "zona": "Estación", "precio": "480€/mes", "dorm": 2, "m2": 65, "agencia": "Inmobiliaria Utrera Centro", "telefono": "955860500", "descripcion": "Ideal para desplazamientos a Sevilla en Cercanías.", "foto": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+piso+utrera+renfe"},
    {"id": "i-a-3", "tipo": "alquiler", "titulo": "Estudio para estudiantes", "zona": "Centro", "precio": "380€/mes", "dorm": 1, "m2": 40, "agencia": "Alcántara Fincas", "telefono": "955860600", "descripcion": "Amueblado y con internet incluido.", "foto": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+estudio+utrera"},
    {"id": "i-g-1", "tipo": "garajes", "titulo": "Plaza de garaje cubierta", "zona": "Trianilla", "precio": "55€/mes", "agencia": "Particular · Utrera", "telefono": "955860700", "descripcion": "Amplia, fácil de aparcar.", "foto": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+garaje+utrera+trianilla"},
    {"id": "i-g-2", "tipo": "garajes", "titulo": "Garaje doble en venta", "zona": "Salesianos", "precio": "18.000€", "agencia": "Ficasa Utrera", "telefono": "955860800", "descripcion": "Dos plazas juntas con trastero.", "foto": "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=venta+garaje+utrera"},
    {"id": "i-l-1", "tipo": "locales", "titulo": "Local comercial a pie de calle", "zona": "C/ Ancha", "precio": "900€/mes", "m2": 90, "agencia": "Grupo Consolación", "telefono": "955860900", "descripcion": "Escaparate 6m, salida de humos.", "foto": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+local+utrera+ancha"},
    {"id": "i-l-2", "tipo": "locales", "titulo": "Nave industrial polígono El Torno", "zona": "Pol. El Torno", "precio": "1.500€/mes", "m2": 400, "agencia": "Inmobiliaria Utrera Centro", "telefono": "955861000", "descripcion": "Con oficina y muelle de carga.", "foto": "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=70", "url": "https://google.com/search?q=alquiler+nave+poligono+torno+utrera"},
]


@app.on_event("startup")
async def seed():
    seeders = [
        ("traffic", SEED_TRAFFIC),
        ("pharmacies", SEED_PHARMACIES),
        ("theater", SEED_THEATER),
        ("transit", SEED_TRANSIT),
        ("events", SEED_EVENTS),
        ("news", SEED_NEWS),
        ("tv", SEED_TV),
        ("anuncios_locales", SEED_ANUNCIOS),
        ("comercios", SEED_COMERCIOS),
        ("hosteleria", SEED_HOSTELERIA),
        ("inmuebles", SEED_INMUEBLES),
    ]
    for coll, docs in seeders:
        if await db[coll].count_documents({}) == 0:
            await db[coll].insert_many([{**d} for d in docs])

    # Refresh stale cultura dates so /api/teatro always has future items.
    today_iso = datetime.now(MADRID_TZ).strftime("%Y-%m-%d")
    if await db.theater.count_documents({"date": {"$lt": today_iso}}) > 0 \
       or await db.events.count_documents({"date": {"$lt": today_iso}}) > 0:
        base = datetime.now(MADRID_TZ)
        for i, s in enumerate(SEED_THEATER):
            fut = (base + timedelta(days=10 + i * 12)).strftime("%Y-%m-%d")
            await db.theater.update_one({"id": s["id"]}, {"$set": {"date": fut}})
        for i, e in enumerate(SEED_EVENTS):
            fut = (base + timedelta(days=5 + i * 15)).strftime("%Y-%m-%d")
            await db.events.update_one({"id": e["id"]}, {"$set": {"date": fut}})
        logger.info("Utrerapp: cultura dates refreshed forward")

    logger.info("Utrerapp seed complete")


@api.get("/")
async def root():
    return {"service": "Utrerapp API", "ok": True}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db():
    client.close()
