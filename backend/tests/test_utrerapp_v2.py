"""Backend tests for Utrerapp v2 feature set: hyperflexible comercios/hosteleria,
auth gating, local-fallback compatible fields, train/chat smoke."""
import os
import re
import uuid
import requests
import pytest

def _load_base():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if v:
        return v.rstrip("/")
    env = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env")
    with open(env) as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip().rstrip("/")
    raise RuntimeError("REACT_APP_BACKEND_URL not found")

BASE = _load_base()
ADMIN_PWD = "955863577"

NEW_COMERCIO_FIELDS = [
    "telefono", "direccion", "web", "menu_pdf_url",
    "oferta_titulo", "oferta_texto", "oferta_imagen",
    "instagram", "facebook", "tiktok", "fotos",
]
NEW_HOSTELERIA_FIELDS = NEW_COMERCIO_FIELDS  # same expected keys


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE}/api/admin/login", json={"password": ADMIN_PWD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth gating ----------
def test_post_comercios_without_token_401():
    r = requests.post(f"{BASE}/api/comercios", json={"nombre": "x", "categoria": "moda"}, timeout=15)
    assert r.status_code == 401
    assert "token" in r.text.lower()


def test_post_hosteleria_without_token_401():
    r = requests.post(f"{BASE}/api/hosteleria", json={"nombre": "x", "tipo": "bares", "telefono": "9"}, timeout=15)
    assert r.status_code == 401


# ---------- Comercios: new fields on GET ----------
def test_get_comercios_contains_new_fields():
    r = requests.get(f"{BASE}/api/comercios", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    sample = data[0]
    for k in NEW_COMERCIO_FIELDS:
        assert k in sample, f"missing field {k} in comercio response"
    assert isinstance(sample["fotos"], list)


# ---------- Hostelería: new fields on GET ----------
def test_get_hosteleria_contains_new_fields():
    r = requests.get(f"{BASE}/api/hosteleria", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    sample = data[0]
    for k in NEW_HOSTELERIA_FIELDS:
        assert k in sample
    assert isinstance(sample["fotos"], list)


# ---------- Comercios: CREATE with full hyperflex payload persists ----------
def test_create_comercio_hyperflex_and_persist(auth_headers):
    cid = f"TEST-com-{uuid.uuid4().hex[:8]}"
    payload = {
        "id": cid,
        "nombre": "DIGITAL GM",
        "categoria": "deportes",
        "descripcion": "Tienda digital",
        "telefono": "955999999",
        "direccion": "C/ Falsa 1",
        "web": "https://digitalgm.es",
        "menu_pdf_url": "https://digitalgm.es/menu.pdf",
        "oferta_titulo": "Rebajas",
        "oferta_texto": "50% dto",
        "oferta_imagen": "https://x.com/a.jpg",
        "instagram": "@digitalgm",
        "facebook": "https://facebook.com/digitalgm",
        "tiktok": "@digitalgm",
        "fotos": ["https://a.jpg", "https://b.jpg"],
    }
    try:
        r = requests.post(f"{BASE}/api/comercios", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        for k, v in payload.items():
            assert body[k] == v, f"{k}: expected {v!r}, got {body.get(k)!r}"
        assert isinstance(body["fotos"], list) and body["fotos"] == payload["fotos"]

        # Verify persistence via GET
        g = requests.get(f"{BASE}/api/comercios", timeout=15)
        assert g.status_code == 200
        found = next((c for c in g.json() if c["id"] == cid), None)
        assert found is not None
        assert found["fotos"] == payload["fotos"]
        assert found["menu_pdf_url"] == payload["menu_pdf_url"]
        assert found["instagram"] == payload["instagram"]
    finally:
        requests.delete(f"{BASE}/api/comercios/{cid}", headers=auth_headers, timeout=15)


# ---------- Hostelería: CREATE with full hyperflex payload persists ----------
def test_create_hosteleria_hyperflex_and_persist(auth_headers):
    hid = f"TEST-hos-{uuid.uuid4().hex[:8]}"
    payload = {
        "id": hid,
        "nombre": "BAR TEST",
        "tipo": "bares",
        "telefono": "600000000",
        "menu_pdf_url": "https://ejemplo.com/menu.pdf",
        "oferta_titulo": "Flamenco en vivo",
        "oferta_texto": "Sábado 22h",
        "oferta_imagen": "https://x.com/promo.jpg",
        "instagram": "@barlocal",
        "facebook": "",
        "tiktok": "",
        "direccion": "C/ Ancha, 22",
        "web": "https://ejemplo.com",
        "fotos": ["https://a.jpg", "https://b.jpg"],
    }
    try:
        r = requests.post(f"{BASE}/api/hosteleria", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        for k, v in payload.items():
            assert body[k] == v, f"{k}: expected {v!r}, got {body.get(k)!r}"

        g = requests.get(f"{BASE}/api/hosteleria", timeout=15)
        found = next((c for c in g.json() if c["id"] == hid), None)
        assert found is not None
        assert found["instagram"] == "@barlocal"
    finally:
        requests.delete(f"{BASE}/api/hosteleria/{hid}", headers=auth_headers, timeout=15)


# ---------- Smoke: train interception plaintext ----------
def test_chat_stream_train_plain_text():
    sess = f"test-{uuid.uuid4().hex[:6]}"
    with requests.post(
        f"{BASE}/api/chat/stream",
        json={"session_id": sess, "message": "Próximo tren a Sevilla"},
        timeout=20, stream=True,
    ) as r:
        assert r.status_code == 200
        text = r.text
    # Expect "Próximo tren a Sevilla: HH:MM." or "Próximos trenes a Sevilla: HH:MM, HH:MM y HH:MM." or last-of-day msg
    assert "Sevilla" in text
    assert "[DONE]" in text
    assert re.search(r"\d{2}:\d{2}", text) or "mañana" in text
