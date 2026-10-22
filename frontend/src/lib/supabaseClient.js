import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzvybwvrkplbipkzkjwg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dnlid3Zya3BsYmlwa3prandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTYyNDUsImV4cCI6MjEwODA5MjI0NX0.WJQ_w9C7I5_DQg1clzoJ2zUB9oemnJXmjwisx9gW6Xw';

export const supabase = createClient(supabaseUrl, supabaseKey);