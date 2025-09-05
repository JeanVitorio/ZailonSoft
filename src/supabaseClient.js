// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Atenção: Use variáveis de ambiente para esconder suas chaves em produção.
// Exemplo com o Vite:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Substitua com sua URL e chave pública.
const supabaseUrl = 'https://bkqqvorbeieqqdnakkly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXF2b3JiZWllcXFkbmFra2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzQzMDgsImV4cCI6MjA3MjM1MDMwOH0.y3IYnxE0Unltz452GCSXvQwVpHGB3xf3HRKWNbutcfQ';

export const supabase = createClient(supabaseUrl, supabaseKey);