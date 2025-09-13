// supabase/functions/_shared/cors.ts

// <-- MUDANÇA: Temporariamente permitimos todas as origens para facilitar os testes locais.
// Antes de ir para produção final, você pode voltar para a lógica com variável de ambiente
// ou colocar seu domínio de produção diretamente aqui.
const allowedOrigins = '*'; 

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};