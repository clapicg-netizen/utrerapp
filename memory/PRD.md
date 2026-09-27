# Utrerapp — PRD

## Problem Statement
Crea una aplicación web progresiva (PWA) llamada Utrerapp, orientada a servicios locales para Utrera. Home: cabecera con avisos de tráfico (Trianilla, Salesianos, Centro), acceso al asistente 'Conso', y grid de módulos: Farmacias de guardia, Teatro Enrique de la Cuadra, Autobuses urbanos y Cercanías Renfe, Agenda de eventos, TV local en directo, y agregador de titulares.

## User Choices
- Chat Conso: **IA real con Emergent LLM Key** (Claude Sonnet 4.6)
- Datos: **Demo realistas** gestionables vía backend
- **Panel admin** con contraseña (demo: `admin123`)
- Idioma: **Español**
- Estilo: por defecto → Andalusian Terracotta & Albero (design_agent)

## Architecture
- **Backend**: FastAPI + MongoDB (motor) + emergentintegrations LlmChat streaming SSE
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + sonner + lucide-react
- **PWA**: manifest.json + theme-color, mobile-first
- **Auth admin**: password → token en memoria (Bearer)

## Implemented (Feb 2026)
- Backend endpoints: /api/traffic, /api/pharmacies, /api/theater, /api/transit, /api/events, /api/news, /api/tv, /api/admin/login, /api/chat/stream (SSE), /api/chat/history/{sid}
- Seed automático de todos los datasets
- Frontend: Home con TrafficTicker marquee + Conso hero card + 6 modules grid
- Páginas: Farmacias, Teatro, Transporte (tabs bus/renfe), Eventos, UtreraTV, Noticias, Conso chat (stream), Admin panel (CRUD 4 secciones)
- Bottom nav + tema claro/oscuro + toasts

## Backlog
- P1: Notificaciones push reales, geolocalización, integración RSS real
- P2: Auth ciudadanos, comentarios noticias, valoración eventos
- P2: Publicar en app stores como TWA
