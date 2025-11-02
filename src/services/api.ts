import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ======================= Tipos =======================
export interface Car {
  id: string;
  nome: string;
  ano: number | null;
  preco: string;          // ⚠️ sua tabela usa string para preço atualmente
  descricao: string;
  imagens: string[];
  loja_id: string;
}

export interface LojaDetails {
  id: string;
  nome: string;
  logo_url: string | null;
}

export interface Client {
  chat_id: string;
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string;
  interested_vehicles: string[]; // armazenado como strings JSON
  documents: string[];
  report: string;
  payment_method: string;
  rg_number: string;
  incomeProof: string;
  rg_photo: string;
  visit_details: { day: string; time: string };
  bot_data: any;
}

export interface ClientPayload {
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string;
  interested_vehicles: { id: string; nome: string }[];
  trade_in_car?: { model: string; year: string; value: string };
  financing_details?: { entry: string; parcels: string };
  visit_details?: { day: string; time: string };
  deal_type: string;
  payment_method?: string;
  bot_data: any;
}

export interface Files {
  documents: File[];
  trade_in_photos: File[];
}

// ======================= Carros =======================

/**
 * Busca veículos apenas da loja atual (isolamento por lojaId).
 */
export const fetchAvailableCars = async (lojaId: string): Promise<Car[]> => {
  if (!lojaId) {
    console.error('fetchAvailableCars: lojaId ausente — retornando vazio por segurança.');
    return [];
  }

  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('loja_id', lojaId);

  if (error) {
    console.error('Erro ao buscar veículos:', error);
    throw new Error('Falha ao buscar veículos disponíveis.');
  }
  return (data || []) as Car[];
};

/** Busca 1 veículo por ID (form público). */
export const fetchCarDetails = async (carId: string): Promise<Car> => {
  const { data, error } = await supabase.from('cars').select('*').eq('id', carId).single();
  if (error) {
    console.error(`Erro ao buscar veículo ${carId}:`, error);
    throw new Error('Veículo não encontrado.');
  }
  return data as Car;
};

/** Busca catálogo público por loja. */
export const fetchCarsByLojaId = async (lojaId: string): Promise<Car[]> => {
  const { data, error } = await supabase.from('cars').select('*').eq('loja_id', lojaId);
  if (error) {
    console.error(`Erro ao buscar veículos da loja ${lojaId}:`, error);
    throw new Error('Falha ao buscar catálogo da loja.');
  }
  return (data || []) as Car[];
};

/** Detalhes públicos da loja (p/ páginas públicas). */
export const fetchLojaDetails = async (lojaId: string): Promise<LojaDetails> => {
  const { data, error } = await supabase
    .from('lojas')
    .select('id, nome, logo_url')
    .eq('id', lojaId)
    .single();

  if (error) {
    console.error('Erro ao buscar detalhes da loja:', error);
    throw new Error('Não foi possível carregar os dados da loja.');
  }
  if (!data) throw new Error('Loja não encontrada.');
  return data as LojaDetails;
};

/**
 * ➕ ADD VEHICLE
 * Salva id, loja_id, nome, descricao, preco(string), ano(number|null), imagens(string[]).
 * Faz upload no bucket `car-images`.
 */
export const addVehicle = async (
  vehicleData: { name: string; year: string; price: string; description: string },
  images: File[],
  lojaId: string
) => {
  try {
    if (!lojaId) throw new Error('Loja não identificada.');

    const carId = uuidv4();
    const imageUrls: string[] = [];

    for (const file of images) {
      const filePath = `${lojaId}/${carId}/${uuidv4()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('car-images').upload(filePath, file);
      if (uploadError) throw new Error(`Falha no upload da imagem: ${uploadError.message}`);
      const { data: publicURLData } = supabase.storage.from('car-images').getPublicUrl(filePath);
      imageUrls.push(publicURLData.publicUrl);
    }

    const insertPayload = {
      id: carId,
      loja_id: lojaId,
      nome: (vehicleData.name ?? '').trim(),
      descricao: (vehicleData.description ?? '').trim(),
      preco: String(vehicleData.price ?? '').trim(), // ⚠️ sua coluna é string
      ano: vehicleData.year ? Number(vehicleData.year) : null,
      imagens: imageUrls,
    };

    const { data, error: dbError } = await supabase
      .from('cars')
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) throw new Error(`Falha ao cadastrar o veículo: ${dbError.message}`);
    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de adição do veículo:', e);
    throw e;
  }
};

/** Atualiza veículo (merge de novas imagens). */
export const updateVehicle = async ({
  carId,
  updatedData,
  newImages,
}: {
  carId: string;
  updatedData: { [key: string]: any };
  newImages: File[];
}) => {
  try {
    const imageUrls: string[] = [];

    if (newImages && newImages.length > 0) {
      for (const file of newImages) {
        const filePath = `${carId}/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('car-images').upload(filePath, file);
        if (uploadError) throw new Error('Falha ao fazer upload da nova imagem.');
        const { data: publicURLData } = supabase.storage.from('car-images').getPublicUrl(filePath);
        imageUrls.push(publicURLData.publicUrl);
      }
    }

    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', carId)
      .single();
    if (fetchError) throw new Error('Falha ao buscar imagens atuais.');

    const finalImages = [...(currentCar?.imagens || []), ...imageUrls];

    const dataToUpdate = { ...updatedData, imagens: finalImages };

    const { data, error: dbError } = await supabase
      .from('cars')
      .update(dataToUpdate)
      .eq('id', carId)
      .select()
      .single();

    if (dbError) throw new Error(`Falha ao atualizar o veículo: ${dbError.message}`);
    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de atualização do veículo:', e);
    throw e;
  }
};

/** Deleta veículo + imagens do bucket. */
export const deleteVehicle = async (vehicleId: string): Promise<string> => {
  try {
    const { data: vehicle, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', vehicleId)
      .single();
    if (fetchError) console.warn('Veículo não encontrado para listar imagens (continua exclusão).');

    const filePaths = (vehicle?.imagens || []).map((url) => url.split('/car-images/')[1]).filter(Boolean);
    if (filePaths.length > 0) {
      await supabase.storage.from('car-images').remove(filePaths);
    }

    const { error: dbError } = await supabase.from('cars').delete().eq('id', vehicleId);
    if (dbError) throw new Error('Falha ao deletar o veículo do banco.');

    return vehicleId;
  } catch (e: any) {
    console.error('Erro no fluxo de exclusão do veículo:', e);
    throw e;
  }
};

/** Deleta uma imagem isolada do veículo e atualiza o array. */
export const deleteVehicleImage = async ({ carId, imageUrl }: { carId: string; imageUrl: string }) => {
  try {
    const filePath = imageUrl.split('/car-images/')[1];
    if (filePath) await supabase.storage.from('car-images').remove([filePath]);

    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', carId)
      .single();
    if (fetchError) throw new Error('Falha ao buscar imagens atuais.');

    const updatedImages = (currentCar?.imagens || []).filter((u: string) => u !== imageUrl);
    const { error: dbError } = await supabase.from('cars').update({ imagens: updatedImages }).eq('id', carId);
    if (dbError) throw new Error('Falha ao atualizar imagens no banco.');

    return updatedImages;
  } catch (e: any) {
    console.error('Erro ao deletar imagem do veículo:', e);
    throw e;
  }
};

// ======================= Clientes =======================

export const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) throw new Error('Falha ao buscar clientes.');
  return (data || []) as Client[];
};

export const createClient = async ({
  clientPayload,
  files,
  lojaId,
}: {
  clientPayload: ClientPayload;
  files: Files;
  lojaId: string;
}) => {
  try {
    const chat_id = `web_${uuidv4()}`;
    const documentUrls: string[] = [];
    const tradeInUrls: string[] = [];

    if (files.documents?.length) {
      for (const file of files.documents) {
        const filePath = `${lojaId}/${chat_id}/documents/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('client-documents').upload(filePath, file);
        if (uploadError) throw new Error(`Falha no upload de documento: ${uploadError.message}`);
        const { data: publicURLData } = supabase.storage.from('client-documents').getPublicUrl(filePath);
        documentUrls.push(publicURLData.publicUrl);
      }
    }

    if (files.trade_in_photos?.length) {
      for (const file of files.trade_in_photos) {
        const filePath = `${lojaId}/${chat_id}/trade-in/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('trade-in-cars').upload(filePath, file);
        if (uploadError) throw new Error(`Falha no upload da foto da troca: ${uploadError.message}`);
        const { data: publicURLData } = supabase.storage.from('trade-in-cars').getPublicUrl(filePath);
        tradeInUrls.push(publicURLData.publicUrl);
      }
    }

    const interestedVehiclesStrings = clientPayload.interested_vehicles.map((v) => JSON.stringify(v));

    const finalClientPayload = {
      ...clientPayload,
      chat_id,
      loja_id: lojaId,
      documents: documentUrls,
      interested_vehicles: interestedVehiclesStrings,
      bot_data: {
        ...clientPayload.bot_data,
        trade_in_car: { ...clientPayload.trade_in_car, photos: tradeInUrls },
      },
    };

    const { data, error: dbError } = await supabase.from('clients').insert(finalClientPayload).select().single();
    if (dbError) throw new Error(`Falha ao cadastrar cliente: ${dbError.message}`);
    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de criação do cliente:', e);
    throw e;
  }
};

export const updateClientDetails = async ({ chatId, updatedData }: { chatId: string; updatedData: any }) => {
  const { data, error } = await supabase.from('clients').update(updatedData).eq('chat_id', chatId).select().single();
  if (error) throw new Error('Falha ao atualizar detalhes do cliente.');
  return data;
};

export const updateClientStatus = async ({ chatId, newState }: { chatId: string; newState: string }) => {
  const { data: clientData, error: fetchError } = await supabase
    .from('clients')
    .select('bot_data')
    .eq('chat_id', chatId)
    .single();
  if (fetchError) throw new Error('Cliente não encontrado.');

  const newBotData = clientData?.bot_data || {};
  newBotData.state = newState;
  newBotData.history = [
    ...(newBotData.history || []),
    { timestamp: new Date().toLocaleString('pt-BR'), updated_data: { state: `Movido para ${newState} via CRM` } },
  ];

  const { data, error } = await supabase
    .from('clients')
    .update({ state: newState, bot_data: newBotData })
    .eq('chat_id', chatId)
    .select()
    .single();
  if (error) throw new Error('Falha ao atualizar status do cliente.');

  return data;
};

export const deleteClient = async (chatId: string) => {
  const { error: dbError } = await supabase.from('clients').delete().eq('chat_id', chatId);
  if (dbError) throw new Error('Falha ao deletar cliente do banco.');
  return chatId;
};

export const uploadClientFile = async ({
  chatId,
  file,
  bucketName,
  filePathPrefix,
}: {
  chatId: string;
  file: File;
  bucketName: string;
  filePathPrefix: string;
}) => {
  const filePath = `${chatId}/${filePathPrefix}/${uuidv4()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
  if (uploadError) throw new Error(`Falha ao fazer upload para ${bucketName}.`);
  const { data: publicURLData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicURLData.publicUrl;
};

export const deleteClientFile = async ({ fileUrl, bucketName }: { fileUrl: string; bucketName: string }) => {
  const filePath = fileUrl.split(`/${bucketName}/`)[1];
  if (!filePath) throw new Error('URL de arquivo inválida.');
  const { error: storageError } = await supabase.storage.from(bucketName).remove([filePath]);
  if (storageError) throw new Error('Falha ao remover arquivo do Storage.');
  return fileUrl;
};

// ======================= Loja (privado) =======================

export const fetchStoreDetails = async () => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase erro ao buscar loja:', error);
    throw new Error('Falha ao buscar dados da sua loja.');
  }
  return data;
};

export const updateStoreDetails = async ({
  lojaId,
  updates,
  newLogoFile,
}: {
  lojaId: string;
  updates: any;
  newLogoFile?: File | null;
}) => {
  let finalUpdates = { ...updates };

  if (newLogoFile) {
    const { data: currentLoja, error: fetchError } = await supabase
      .from('lojas')
      .select('logo_url')
      .eq('id', lojaId)
      .single();
    if (fetchError) throw new Error('Não foi possível encontrar a loja para atualizar a logo.');

    if (currentLoja?.logo_url) {
      const oldFilePath = currentLoja.logo_url.split('/logo-loja/')[1];
      if (oldFilePath) {
        const { error: removeError } = await supabase.storage.from('logo-loja').remove([oldFilePath]);
        if (removeError) console.warn('Falha ao remover logo antiga (prossegue).', removeError);
      }
    }

    const fileExt = newLogoFile.name.split('.').pop();
    const filePath = `${lojaId}/${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('logo-loja').upload(filePath, newLogoFile);
    if (uploadError) throw new Error(`Falha ao fazer upload da nova logo: ${uploadError.message}`);

    const { data: publicURLData } = supabase.storage.from('logo-loja').getPublicUrl(filePath);
    finalUpdates.logo_url = publicURLData.publicUrl;
  }

  const { data, error } = await supabase.from('lojas').update(finalUpdates).eq('id', lojaId).select().single();
  if (error) throw new Error(`Falha ao atualizar os dados da loja: ${error.message}`);
  return data;
};

// ======================= Vendedores =======================

export const fetchVendedores = async (lojaId: string) => {
  if (!lojaId) return [];
  const { data, error } = await supabase.from('vendedores').select('*').eq('loja_id', lojaId);
  if (error) {
    console.error('Erro ao buscar vendedores:', error);
    throw new Error('Falha ao buscar vendedores.');
  }
  return data;
};

export const createVendedor = async (vendedorData: any) => {
  const { data, error } = await supabase.from('vendedores').insert(vendedorData).select().single();
  if (error) throw new Error(`Falha ao adicionar vendedor: ${error.message}`);
  return data;
};

export const deleteVendedor = async (vendedorId: string) => {
  const { error } = await supabase.from('vendedores').delete().eq('id', vendedorId);
  if (error) throw new Error('Falha ao deletar vendedor.');
  return vendedorId;
};
