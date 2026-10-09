// Hybrid storage: when the API is down or the admin token is invalid,
// records are persisted in localStorage so the UI keeps working.
// Public views also read from localStorage and merge with API data.

const KEYS = {
  "/comercios": "local_comercios",
  "/hosteleria": "local_hosteleria",
  "/inmuebles": "local_inmuebles",
  "/anuncios": "local_anuncios",
  "/traffic": "local_traffic",
  "/pharmacies": "local_pharmacies",
  "/events": "local_events",
  "/news": "local_news",
  "/theater": "local_theater",
};

export const localKey = (endpoint) =>
  KEYS[endpoint] || `local_${endpoint.replace(/[^a-z0-9]/gi, "_")}`;

export const readLocal = (endpoint) => {
  try {
    const raw = localStorage.getItem(localKey(endpoint));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeLocal = (endpoint, arr) => {
  try {
    localStorage.setItem(localKey(endpoint), JSON.stringify(arr || []));
    try {
      window.dispatchEvent(
        new CustomEvent("utrerapp:local-updated", { detail: { endpoint } })
      );
    } catch { /* non-browser env */ }
  } catch {
    // Quota or privacy mode — silently drop; UI still works in-memory.
  }
};

export const genLocalId = () =>
  "loc-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const addLocal = (endpoint, item) => {
  const arr = readLocal(endpoint);
  const withId = { ...item, id: item.id || genLocalId(), _local: true };
  const idx = arr.findIndex((x) => x.id === withId.id);
  if (idx >= 0) arr[idx] = { ...arr[idx], ...withId };
  else arr.unshift(withId);
  writeLocal(endpoint, arr);
  return withId;
};

export const patchLocal = (endpoint, id, patch) => {
  const arr = readLocal(endpoint);
  const idx = arr.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  arr[idx] = { ...arr[idx], ...patch };
  writeLocal(endpoint, arr);
  return arr[idx];
};

export const removeLocal = (endpoint, id) => {
  const arr = readLocal(endpoint).filter((x) => x.id !== id);
  writeLocal(endpoint, arr);
  return true;
};

// Merge server + local for public views. De-dupes by id, local wins on conflict.
export const mergeWithLocal = (endpoint, serverArr) => {
  const local = readLocal(endpoint);
  const byId = new Map();
  for (const it of serverArr || []) byId.set(it.id, it);
  for (const it of local) byId.set(it.id, { ...byId.get(it.id), ...it });
  return Array.from(byId.values());
};

// Image URL / data URI sanitizer. Rejects empty, "null", unknown schemes
// so broken thumbnails don't render frames.
export const isValidImage = (src) => {
  if (!src || typeof src !== "string") return false;
  const s = src.trim();
  if (!s || s === "null" || s === "undefined" || s === "#") return false;
  if (s.startsWith("data:image/")) return true;
  if (/^https?:\/\/\S+\.(jpg|jpeg|png|webp|gif|avif|svg)(\?\S*)?$/i.test(s)) return true;
  // Allow any https URL as a last resort — browser will handle fallback via onError.
  return /^https?:\/\/\S+/i.test(s);
};

export const safeImg = (src) => (isValidImage(src) ? src : null);

// Clean photos array: unique, valid URLs/data URIs only.
export const cleanPhotos = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const p of list) {
    if (!isValidImage(p)) continue;
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
};

// Human URL helpers for quick actions.
export const telHref = (phone) =>
  phone ? `tel:${String(phone).replace(/\s+/g, "")}` : null;

export const whatsappHref = (num, name) => {
  if (!num) return null;
  const clean = String(num).replace(/[^\d]/g, "");
  if (!clean) return null;
  const msg = name
    ? encodeURIComponent(`Hola, te escribo desde Utrerapp por "${name}".`)
    : "";
  return `https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`;
};

export const mapsHref = (address) => {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address}, Utrera`
  )}`;
};

export const safeExternal = (url) => {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s || s === "#" || s === "null") return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
};
