import { createClient } from '@supabase/supabase-js';

const fragment = new URLSearchParams(window.location.hash.slice(1));
export const retornoRecuperacion = fragment.get('type') === 'recovery';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
);