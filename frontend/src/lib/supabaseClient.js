import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqhweoknhlxsdlnfnack.supabase.co';
const supabasePublishableKey = 'sb_publishable_jlm8mguzu0fObZq_3DCyVQ_jw956...';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);