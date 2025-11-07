import { supabase } from './supabaseClient';

export type Car = {
  id: string;
  nome: string;
  ano: number;
  preco: string | number;
  imagens?: string[];
  loja_id?: string;
};

export type Files = {
  documents: File[];
  trade_in_photos: File[];
};

export type ClientPayload = {
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string; // 'proposta_web' etc
  deal_type: string; // 'comum' | 'troca' | 'visita' | 'a_vista' | 'financiamento'
  payment_method: string; // 'a_vista' | 'financiamento' | ''
  interested_vehicles: Car[]; // coluna TEXT -> salvar string
  trade_in_car: { model: string; year: string; value: string }; // TEXT -> string
  financing_details: { entry: string | number; parcels: string | number }; // TEXT -> string
  visit_details: { day: string; time: string }; // JSONB -> objeto
  bot_data: Record<string, any>; // JSONB -> objeto
};

async function uploadFilesToBucket(bucket: string, prefix: string, flist: File[]) {
  const urls: string[] = [];
  for (const f of flist) {
    const path = `${prefix}/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, f, {
      upsert: false,
      contentType: f.type || 'application/octet-stream',
    });
    if (error) throw new Error(`Falha no upload: ${error.message}`);
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return urls;
}

/**
 * Cria um registro em public.clients:
 * - Faz upload opcional de arquivos p/ Storage
 * - Preenche created_at/updated_at
 * - Respeita TEXT vs JSONB conforme seu schema
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
  const uploaded = { documents: [] as string[], trade_in_photos: [] as string[] };

  const folderPrefix = `clients/${lojaId}/${Date.now()}`;
  if (files?.documents?.length) {
    uploaded.documents = await uploadFilesToBucket('clients', `${folderPrefix}/documents`, files.documents);
  }
  if (files?.trade_in_photos?.length) {
    uploaded.trade_in_photos = await uploadFilesToBucket('clients', `${folderPrefix}/trade_in_photos`, files.trade_in_photos);
  }

  // Campos TEXT: stringificar
  const interestedVehiclesText = JSON.stringify(clientPayload.interested_vehicles ?? []);
  const tradeInCarText = JSON.stringify(clientPayload.trade_in_car ?? {});
  const financingDetailsText = JSON.stringify(clientPayload.financing_details ?? {});

  // Campos JSONB: enviar OBJETO
  const visitDetailsJson = clientPayload.visit_details ?? null;
  const botDataJson = {
    ...(clientPayload.bot_data ?? {}),
    uploaded_documents: uploaded.documents,
    uploaded_trade_in_photos: uploaded.trade_in_photos,
  };

  const nowIso = new Date().toISOString();

  const rowToInsert = {
    chat_id: crypto.randomUUID(), // ajuste se tiver um chat_id real
    loja_id: lojaId,
    state: clientPayload.state || 'proposta_web',

    name: clientPayload.name,
    phone: clientPayload.phone,
    cpf: clientPayload.cpf,
    job: clientPayload.job,

    payment_method: clientPayload.payment_method,
    deal_type: clientPayload.deal_type,

    // TEXT
    interested_vehicles: interestedVehiclesText,
    trade_in_car: tradeInCarText,
    financing_details: financingDetailsText,

    // JSONB
    visit_details: visitDetailsJson,
    bot_data: botDataJson,

    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(rowToInsert)
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao salvar formulário: ${error.message}`);
  return data;
}
