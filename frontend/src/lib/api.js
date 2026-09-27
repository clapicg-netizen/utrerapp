import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("utrerapp_admin_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const getSessionId = () => {
  let s = localStorage.getItem("utrerapp_session");
  if (!s) {
    s = "sess-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("utrerapp_session", s);
  }
  return s;
};
