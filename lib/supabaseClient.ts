import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlqpzfxfqtbjpxilsoei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscXB6ZnhmcXRianB4aWxzb2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTc0ODksImV4cCI6MjA3Njk3MzQ4OX0.mKXWjFhFhkv5LIqvuSGOlr9-EOfZ4qEd1CoFWmEv5_o';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);