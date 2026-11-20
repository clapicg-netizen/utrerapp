// This deployment uses local demo data. This file has no network client.
const demoSession = { user: { id: 'admin-demo' } };
let session = demoSession;
const listeners = new Set();
let entries = [{ id: 1, nombre: 'Librería de ejemplo', categoria: 'Comercio', tipo_ficha: 'normal' }];

function setSession(next) {
  session = next;
  listeners.forEach(listener => listener('DEMO_SESSION', session));
}

function from() {
  let id;
  let patch;
  const query = {
    select: () => query,
    eq: (_column, value) => { id = value; return query; },
    order: async () => ({ data: [...entries] }),
    insert: value => { patch = value; return query; },
    update: value => { patch = value; return query; },
    single: async () => {
      const target = id == null
        ? { id: Math.max(0, ...entries.map(entry => entry.id)) + 1 }
        : entries.find(entry => entry.id === id);
      if (!session || !target) return { error: new Error('Sin acceso') };
      const data = { ...target, ...patch };
      entries = [...entries.filter(entry => entry.id !== data.id), data];
      return { data };
    },
  };
  return query;
}

const blobs = new Map();

export const supabase = {
  auth: {
    onAuthStateChange(listener) {
      listeners.add(listener);
      queueMicrotask(() => {
        if (listeners.has(listener)) listener('INITIAL_SESSION', session);
      });
      return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
    },
    async signInWithOtp() { setSession(demoSession); return {}; },
    async signOut() { setSession(null); },
  },
  rpc: async () => ({ data: Boolean(session) }),
  from,
  storage: {
    from: () => ({
      async upload(path, file) {
        if (!session) return { error: new Error('Sin acceso') };
        blobs.set(path, URL.createObjectURL(file));
        return { data: { path } };
      },
      getPublicUrl: path => ({ data: { publicUrl: blobs.get(path) } }),
    }),
  },
};
