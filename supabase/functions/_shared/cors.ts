// supabase/functions/_shared/cors.ts
const allowedOrigins = Deno.env.get('ENV') === 'development' ? '*' : 'www.zailonsoft.com.br';
export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
