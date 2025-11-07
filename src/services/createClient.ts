// src/services/createClient.ts
import { createClient } from '@supabase/supabase-js';

type Car = {
  id: string;
  nome: string;
  ano: number;
  preco: string | number;
  imagens?: string[];
  loja_id?: string;
};

type Files = {
  documents: File[];        // opcional
  trade_in_photos: File[];  // opcional
};

type ClientPayload = {
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string;                         // ex: 'proposta_web'
  deal_type: string;                     // 'comum' | 'troca' | 'visita' | 'a_vista' | 'financiamento'
  payment_method: string;                // 'a_vista' | 'financiamento' | ''
  interested_vehicles: Car[];            // no banco existe uma coluna text, salvaremos stringificada
  trade_in_car: { model: string; year: string; value: string };
  financing_details: { entry: string | number; parcels: string | number };
  visit_details: { day: string; time: string };
  bot_data: Record<string, any>;         // jsonb livre
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Salva o formulário na tabela public.clients com created_at definido.
 * - Faz upload opcional dos arquivos para o Storage e grava as URLs em bot_data.
 * - Retorna a linha criada.
 */
export async function createClientRecord({
  clientPayload,
  files,
  lojaId,
}: {
  clientPayload: ClientPayload;
  files?: Files;
  lojaId: string;
}) {
  // 1) Upload opcional dos arquivos para o Storage (se houver)
  const uploaded: { documents: string[]; trade_in_photos: string[] } = {
    documents: [],
    trade_in_photos: [],
  };

  // helper de upload para uma pasta baseada no timestamp
  async function uploadFilesToBucket(bucket: string, prefix: string, flist: File[]) {
    const urls: string[] = [];
    for (const f of flist) {
      const filePath = `${prefix}/${Date.now()}-${f.name}`;
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, f, {
        upsert: false,
        contentType: f.type || 'application/octet-stream',
      });
      if (error) throw new Error(`Falha no upload: ${error.message}`);
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
      urls.push(pub.publicUrl);
    }
    return urls;
  }

  const folderPrefix = `clients/${lojaId}/${Date.now()}`;

  if (files?.documents?.length) {
    uploaded.documents = await uploadFilesToBucket('clients', `${folderPrefix}/documents`, files.documents);
  }
  if (files?.trade_in_photos?.length) {
    uploaded.trade_in_photos = await uploadFilesToBucket('clients', `${folderPrefix}/trade_in_photos`, files.trade_in_photos);
  }

  // 2) Monta os campos conforme o schema existente
  //    Observação: a tabela tem colunas text para alguns campos complexos; vamos stringificar.
  const nowIso = new Date().toISOString();

  const rowToInsert = {
    // identificadores/estado
    chat_id: crypto.randomUUID(),                // você pode trocar por um chat_id real do seu bot
    loja_id: lojaId,
    state: clientPayload.state || 'proposta_web',

    // dados do cliente
    name: clientPayload.name,
    phone: clientPayload.phone,
    cpf: clientPayload.cpf,
    job: clientPayload.job,

    // negócio/pagamento
    payment_method: clientPayload.payment_method,
    deal_type: clientPayload.deal_type,

    // campos text que precisam de string JSON:
    financing_details: JSON.stringify(clientPayload.financing_details ?? {}),
    interested_vehicles: JSON.stringify(clientPayload.interested_vehicles ?? []),
    trade_in_car: JSON.stringify(clientPayload.trade_in_car ?? {}),

    // details (jsonb)
    visit_details: clientPayload.visit_details ? JSON.stringify(clientPayload.visit_details) : null,

    // bot_data (jsonb) enriquecido com URLs de arquivos
    bot_data: JSON.stringify({
      ...(clientPayload.bot_data ?? {}),
      uploaded_documents: uploaded.documents,
      uploaded_trade_in_photos: uploaded.trade_in_photos,
    }),

    // carimbo de data explícito (apesar do DEFAULT now())
    created_at: nowIso,
    updated_at: nowIso,
  };

  // 3) Inserção
  const { data, error } = await supabase
    .from('clients')
    .insert(rowToInsert)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Erro ao salvar formulário: ${error.message}`);
  }

  return data;
}
