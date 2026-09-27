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
from datetime import datetime, timezone
import asyncio

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


# ---------- Conso Chat (streaming) ----------
CONSO_SYSTEM = (
    "Eres Conso, el asistente virtual oficial de Utrerapp, la app de servicios locales "
    "de Utrera (Sevilla, España). Respondes SIEMPRE en español, con tono cercano, "
    "cálido y andaluz pero profesional. Ayudas con: farmacias de guardia, tráfico "
    "en Trianilla/Salesianos/Centro, horarios de autobuses urbanos y Cercanías Renfe C1, "
    "eventos y fiestas (Feria de la Manzanilla, Potaje Gitano, Semana Santa utrerana), "
    "Teatro Enrique de la Cuadra, noticias locales y trámites. Si no sabes algo con "
    "certeza, dilo con honestidad y sugiere dónde consultar. Sé conciso: máximo 4-5 "
    "frases salvo que pidan detalle. Nunca inventes teléfonos ni direcciones exactas."
)


@api.post("/chat/stream")
async def chat_stream(body: ChatBody):
    async def gen():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=body.session_id,
                system_message=CONSO_SYSTEM,
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
    ]
    for coll, docs in seeders:
        if await db[coll].count_documents({}) == 0:
            await db[coll].insert_many([{**d} for d in docs])
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
