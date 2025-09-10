// supabase/functions/_shared/cors.ts

// URL do seu site oficial
const allowedOrigins = 'https://zailonsoft.com.br';

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}