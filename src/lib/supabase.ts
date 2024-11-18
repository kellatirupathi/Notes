import { createClient } from '@supabase/supabase-js';

// Fallback to demo database if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jlvukxhphyndmqjartwh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdnVreGhwaHluZG1xamFydHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg0Njk0OCwiZXhwIjoyMDQ3NDIyOTQ4fQ.-E4K-0glzCBRQWvFLGVPVgyVKAjcsvUTB2YCqm3Qk9c';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database schema
export const initializeSchema = async () => {
  try {
    const { error } = await supabase.rpc('init_notes_schema');
    if (error) throw error;
  } catch (error) {
    console.warn('Schema initialization failed:', error);
    // Continue anyway as the schema might already exist
  }
};