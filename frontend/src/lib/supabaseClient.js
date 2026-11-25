import { createClient } from '@supabase/supabase-js';

const fragment = new URLSearchParams(window.location.hash.slice(1));
const accesoTeatro = process.env.REACT_APP_CULTURA_SUPABASE_URL === 'https://bkpusgqsatyymqbisjcv.supabase.co' &&
  new URLSearchParams(window.location.search).get('vista') === 'gestor-teatro';
export const retornoRecuperacion = !accesoTeatro && fragment.get('type') === 'recovery';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  { auth: { detectSessionInUrl: !accesoTeatro } },
);
