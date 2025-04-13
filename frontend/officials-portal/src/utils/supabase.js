import { createClient } from '@supabase/supabase-js';

console.log('Import Meta Env:', import.meta.env);

const supabaseUrl = "https://lruqixbtxalhdtvsnmcz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydXFpeGJ0eGFsaGR0dnNubWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyOTg0MDYsImV4cCI6MjA1NDg3NDQwNn0.NNir6Kd0cn0zMm6QsjuaChOH10-XKRBLbi0n3Zh5Ngk";

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);