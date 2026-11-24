import { createClient } from '@supabase/supabase-js';

import publicSupabase from './publicSupabase.cjs';

const fragment = new URLSearchParams(window.location.hash.slice(1));
export const retornoRecuperacion = fragment.get('type') === 'recovery';

export const supabase = createClient(publicSupabase.url, publicSupabase.anonKey);