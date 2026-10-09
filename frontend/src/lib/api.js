import axios from "axios";

// Instancia principal exportada en minúscula
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Alias en mayúsculas para compatibilidad con Conso.jsx
export const API = api;

// Interceptor para inyectar automáticamente la cabecera de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "admin-dev-token";
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Admin-Token"] = token;
  return config;
});

// Función auxiliar para obtener o generar un ID de sesión único
export function getSessionId() {
  let sessionId = localStorage.getItem("utrerapp_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("utrerapp_session_id", sessionId);
  }
  return sessionId;
}