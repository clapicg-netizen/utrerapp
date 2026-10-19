import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqhweoknhlxsdlnfnack.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaHdlb2tuaGx4c2RsbmZuYWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MDI2MTQsImV4cCI6MjEwNjA3ODYxNH0.cYk0B5Sop31qJTvqQxe4THDQS1lZJeTcqjLPM2vOJow';

export const supabase = createClient(supabaseUrl, supabaseKey);