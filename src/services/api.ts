import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// --- Tipos e Interfaces ---
export interface Car {
    id: string;
    nome: string;
    ano: number;
    preco: string;
    descricao: string;
    imagens: string[];
    // Adicionando loja_id que é essencial para as novas rotas
    loja_id: string; 
}

export interface Client {
    chat_id: string;
    name: string;
    phone: string;
    cpf: string;
    job: string;
    state: string;
    interested_vehicles: string[];
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

// --- Funções da API para Carros ---

// RLS filtra os carros da loja do usuário logado automaticamente.
export const fetchAvailableCars = async (): Promise<Car[]> => {
    const { data, error } = await supabase.from('cars').select('*');
    if (error) {
        console.error('Erro ao buscar veículos:', error);
        throw new Error('Falha ao buscar veículos disponíveis.');
    }
    // O RLS já deve filtrar por loja do usuário logado aqui
    return data as Car[]; 
};

/**
 * NOVO: Busca um carro pelo ID (usado na rota pública do formulário).
 */
export const fetchCarDetails = async (carId: string): Promise<Car> => {
    // Nota: Esta query é pública. Certifique-se que suas RLS policies
    // permitam SELECT de carros por `carId` para `anon` ou `authenticated`.
    const { data, error } = await supabase.from('cars').select('*').eq('id', carId).single();
    if (error) {
        console.error(`Erro ao buscar veículo ${carId}:`, error);
        throw new Error('Veículo não encontrado ou falha na busca.');
    }
    return data as Car;
};

/**
 * NOVO: Busca todos os carros de uma loja específica (usado no catálogo público).
 */
export const fetchCarsByLojaId = async (lojaId: string): Promise<Car[]> => {
    // Nota: Esta query é pública. Garanta que RLS permita SELECT de carros por `loja_id`.
    const { data, error } = await supabase.from('cars').select('*').eq('loja_id', lojaId);
    if (error) {
        console.error(`Erro ao buscar veículos da loja ${lojaId}:`, error);
        throw new Error('Falha ao buscar catálogo da loja.');
    }
    return data as Car[];
};


// Adicionado 'lojaId' para saber onde inserir o veículo.
export const addVehicle = async (
    vehicleData: { name: string; year: string; price: string; description: string; },
    images: File[],
    lojaId: string
) => {
    try {
        const carId = uuidv4();
        const imageUrls: string[] = [];

        for (const file of images) {
            const filePath = `${lojaId}/${carId}/${uuidv4()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('car-images').upload(filePath, file);
            if (uploadError) throw new Error('Falha ao fazer upload da imagem.');

            const { data: publicURLData } = supabase.storage.from('car-images').getPublicUrl(filePath);
            imageUrls.push(publicURLData.publicUrl);
        }

        const { data, error: dbError } = await supabase
            .from('cars')
            .insert({
                id: carId,
                loja_id: lojaId,
                nome: vehicleData.name,
                ano: Number(vehicleData.year),
                preco: vehicleData.price,
                descricao: vehicleData.description,
                imagens: imageUrls
            })
            .select();

        if (dbError) throw new Error(`Falha ao cadastrar o veículo: ${dbError.message}`);
        return data[0];

    } catch (e: any) {
        console.error('Erro no fluxo de adição do veículo:', e);
        throw e;
    }
};

// RLS protege a atualização, permitindo apenas para carros da loja do usuário.
export const updateVehicle = async ({ carId, updatedData, newImages }: { carId: string; updatedData: { [key: string]: any }; newImages: File[] }) => {
    try {
        const imageUrls: string[] = [];

        if (newImages.length > 0) {
            for (const file of newImages) {
                const filePath = `${carId}/${uuidv4()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('car-images').upload(filePath, file);
                if (uploadError) throw new Error('Falha ao fazer upload da nova imagem.');

                const { data: publicURLData } = supabase.storage.from('car-images').getPublicUrl(filePath);
                imageUrls.push(publicURLData.publicUrl);
            }
        }

        const { data: currentCar, error: fetchError } = await supabase.from('cars').select('imagens').eq('id', carId).single();
        if (fetchError) throw new Error('Falha ao buscar dados do veículo para atualização.');

        const finalImages = [...(currentCar.imagens || []), ...imageUrls];

        const dataToUpdate = { ...updatedData, imagens: finalImages };

        const { data, error: dbError } = await supabase
            .from('cars')
            .update(dataToUpdate)
            .eq('id', carId)
            .select();

        if (dbError) throw new Error('Falha ao atualizar o veículo no banco de dados.');
        return data[0];

    } catch (e: any) {
        console.error('Erro no fluxo de atualização do veículo:', e);
        throw e;
    }
};

export const deleteVehicle = async (vehicleId: string): Promise<string> => {
    try {
        const { data: vehicle, error: fetchError } = await supabase.from('cars').select('imagens').eq('id', vehicleId).single();
        if (fetchError) console.warn('Veículo não encontrado, mas a exclusão prosseguirá.');

        const filePaths = (vehicle?.imagens || []).map(url => url.split('/car-images/')[1]);
        if (filePaths.length > 0) {
            await supabase.storage.from('car-images').remove(filePaths);
        }

        const { error: dbError } = await supabase.from('cars').delete().eq('id', vehicleId);
        if (dbError) throw new Error('Falha ao deletar o veículo do banco de dados.');

        return vehicleId;
    } catch (e: any) {
        console.error('Erro no fluxo de exclusão do veículo:', e);
        throw e;
    }
};

export const deleteVehicleImage = async ({ carId, imageUrl }: { carId: string, imageUrl: string }) => {
    try {
        const filePath = imageUrl.split('/car-images/')[1];
        await supabase.storage.from('car-images').remove([filePath]);

        const { data: currentCar, error: fetchError } = await supabase.from('cars').select('imagens').eq('id', carId).single();
        if (fetchError) throw new Error('Falha ao buscar dados do veículo para atualizar imagens.');

        const updatedImages = (currentCar.imagens as string[]).filter((url: string) => url !== imageUrl);
        const { error: dbError } = await supabase.from('cars').update({ imagens: updatedImages }).eq('id', carId);
        if (dbError) throw new Error('Falha ao atualizar o registro de imagens no banco de dados.');

        return updatedImages;
    } catch (e: any) {
        console.error('Erro ao deletar imagem do veículo:', e);
        throw e;
    }
};

// --- Funções da API para Clientes ---

export const fetchClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw new Error('Falha ao buscar clientes.');
    return data as Client[];
};

export const createClient = async ({ clientPayload, files, lojaId }: { clientPayload: ClientPayload; files: Files; lojaId: string; }) => {
    try {
        const chat_id = `web_${uuidv4()}`;
        const documentUrls: string[] = [];
        const tradeInUrls: string[] = [];
        
        if (files.documents && files.documents.length > 0) {
            for (const file of files.documents) {
                const filePath = `${lojaId}/${chat_id}/documents/${uuidv4()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('client-documents').upload(filePath, file);
                if (uploadError) throw new Error(`Falha no upload de documento: ${uploadError.message}`);
                const { data: publicURLData } = supabase.storage.from('client-documents').getPublicUrl(filePath);
                documentUrls.push(publicURLData.publicUrl);
            }
        }
        
        if (files.trade_in_photos && files.trade_in_photos.length > 0) {
            for (const file of files.trade_in_photos) {
                const filePath = `${lojaId}/${chat_id}/trade-in/${uuidv4()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('trade-in-cars').upload(filePath, file);
                if (uploadError) throw new Error(`Falha no upload da foto da troca: ${uploadError.message}`);
                const { data: publicURLData } = supabase.storage.from('trade-in-cars').getPublicUrl(filePath);
                tradeInUrls.push(publicURLData.publicUrl);
            }
        }
        
        const interestedVehiclesStrings = clientPayload.interested_vehicles.map(vehicle => JSON.stringify(vehicle));

        const finalClientPayload = {
            ...clientPayload,
            chat_id: chat_id,
            loja_id: lojaId,
            documents: documentUrls,
            interested_vehicles: interestedVehiclesStrings,
            bot_data: {
                ...clientPayload.bot_data,
                trade_in_car: { ...clientPayload.trade_in_car, photos: tradeInUrls }
            }
        };

        const { data, error: dbError } = await supabase.from('clients').insert(finalClientPayload).select();
        if (dbError) throw new Error(`Falha ao cadastrar cliente no banco de dados. Erro: ${dbError.message}`);
        return data[0];
    } catch (e: any) {
        console.error('Erro no fluxo de criação do cliente:', e);
        throw e;
    }
};

export const updateClientDetails = async ({ chatId, updatedData }: { chatId: string, updatedData: any }) => {
    try {
        const { data, error } = await supabase
            .from('clients')
            .update(updatedData)
            .eq('chat_id', chatId)
            .select();

        if (error) throw new Error('Falha ao atualizar detalhes do cliente.');
        return data[0];
    } catch (e: any) {
        console.error('Erro ao atualizar cliente:', e);
        throw e;
    }
};

export const updateClientStatus = async ({ chatId, newState }: { chatId: string, newState: string }) => {
    try {
        const { data: clientData, error: fetchError } = await supabase.from('clients').select('bot_data').eq('chat_id', chatId).single();
        if (fetchError) throw new Error('Cliente não encontrado para atualização de status.');

        const newBotData = clientData.bot_data || {};
        newBotData.state = newState;
        newBotData.history = [...(newBotData.history || []), { timestamp: new Date().toLocaleString("pt-BR"), updated_data: { state: `Movido para ${newState} via CRM` } }];

        const { data, error } = await supabase.from('clients').update({ state: newState, bot_data: newBotData }).eq('chat_id', chatId).select();
        if (error) throw new Error('Falha ao atualizar status do cliente.');

        return data[0];
    } catch (e: any) {
        console.error('Erro ao atualizar status do cliente:', e);
        throw e;
    }
};

export const deleteClient = async (chatId: string) => {
    try {
        const { error: dbError } = await supabase.from('clients').delete().eq('chat_id', chatId);
        if (dbError) throw new Error('Falha ao deletar cliente do banco de dados.');

        return chatId;
    } catch (e: any) {
        console.error('Erro ao deletar cliente:', e);
        throw e;
    }
};

export const uploadFiles = async ({ chatId, files }: { chatId: string, files: { file: File }[] }) => {
    try {
        const { data: client, error: fetchError } = await supabase.from('clients').select('documents').eq('chat_id', chatId).single();
        if (fetchError) throw new Error('Cliente não encontrado para upload de arquivos.');

        const existingDocuments = client.documents || [];
        const newDocumentUrls = [];

        for (const fileObj of files) {
            const filePath = `${chatId}/documents/${uuidv4()}-${fileObj.file.name}`;
            const { error: uploadError } = await supabase.storage.from('client-documents').upload(filePath, fileObj.file);
            if (uploadError) throw new Error('Falha ao enviar arquivo.');

            const { data: publicURLData } = supabase.storage.from('client-documents').getPublicUrl(filePath);
            newDocumentUrls.push(publicURLData.publicUrl);
        }

        const { data, error: dbError } = await supabase.from('clients').update({ documents: [...existingDocuments, ...newDocumentUrls] }).eq('chat_id', chatId).select();
        if (dbError) throw new Error('Falha ao atualizar a lista de documentos no banco de dados.');

        return data[0];
    } catch (e: any) {
        console.error('Erro ao fazer upload de arquivos:', e);
        throw e;
    }
};

export const deleteFiles = async ({ chatId, filePaths }: { chatId: string, filePaths: string[] }) => {
    try {
        const { data: client, error: fetchError } = await supabase.from('clients').select('documents').eq('chat_id', chatId).single();
        if (fetchError) throw new Error('Cliente não encontrado para remoção de arquivos.');

        const fileNames = filePaths.map(url => url.split('/client-documents/')[1]).filter(Boolean);
        if (fileNames.length > 0) {
            await supabase.storage.from('client-documents').remove(fileNames);
        }

        const updatedDocuments = (client.documents || []).filter((doc: string) => !filePaths.includes(doc));
        const { data, error: dbError } = await supabase.from('clients').update({ documents: updatedDocuments }).eq('chat_id', chatId).select();
        if (dbError) throw new Error('Falha ao atualizar a lista de documentos no banco de dados.');

        return data[0];
    } catch (e: any) {
        console.error('Erro ao deletar arquivos:', e);
        throw e;
    }
};

export const uploadClientFile = async ({ chatId, file, bucketName, filePathPrefix }: { chatId: string, file: File, bucketName: string, filePathPrefix: string }) => {
    try {
        const filePath = `${chatId}/${filePathPrefix}/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        if (uploadError) throw new Error(`Falha ao fazer upload para ${bucketName}.`);
        const { data: publicURLData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return publicURLData.publicUrl;
    } catch (e) {
        console.error('Erro no upload de arquivo do cliente:', e);
        throw e;
    }
}

export const deleteClientFile = async ({ fileUrl, bucketName }: { fileUrl: string, bucketName: string }) => {
    try {
        const filePath = fileUrl.split(`/${bucketName}/`)[1];
        if (!filePath) throw new Error("URL de arquivo inválida ou bucket não encontrado na URL.");
        
        const { error: storageError } = await supabase.storage.from(bucketName).remove([filePath]);
        if (storageError) throw new Error('Falha ao remover arquivo do Storage.');
        return fileUrl;
    } catch (e: any) {
        console.error('Erro ao deletar arquivo do cliente:', e);
        throw e;
    }
}


// --- Funções da API para Gerenciamento da Loja ---

export const fetchStoreDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Usuário não autenticado. Faça o login para continuar.");
    }

    const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (error) {
        console.error("Erro do Supabase ao buscar dados da loja:", error);
        throw new Error('Falha ao buscar os dados da sua loja.');
    }
    
    return data;
};

// --- [FUNÇÃO ATUALIZADA E CORRIGIDA] ---
export const updateStoreDetails = async ({ lojaId, updates, newLogoFile }: { lojaId: string, updates: any, newLogoFile?: File | null }) => {
    let finalUpdates = { ...updates };

    // 1. Se um novo arquivo de logo foi enviado
    if (newLogoFile) {
        // Busca a URL da logo antiga para poder excluí-la
        const { data: currentLoja, error: fetchError } = await supabase
            .from('lojas')
            .select('logo_url')
            .eq('id', lojaId)
            .single();

        if (fetchError) {
            throw new Error('Não foi possível encontrar a loja para atualizar a logo.');
        }

        // Se uma logo antiga existe, remove ela do Storage
        if (currentLoja && currentLoja.logo_url) {
            const oldFilePath = currentLoja.logo_url.split('/logo-loja/')[1];
            if (oldFilePath) {
                const { error: removeError } = await supabase.storage.from('logo-loja').remove([oldFilePath]);
                if(removeError) console.error("Erro ao remover logo antiga, mas continuando processo:", removeError);
            }
        }

        // 2. Faz o upload da nova logo
        const fileExt = newLogoFile.name.split('.').pop();
        const filePath = `${lojaId}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('logo-loja') // <-- Usa o nome do seu bucket
            .upload(filePath, newLogoFile);

        if (uploadError) {
            throw new Error(`Falha ao fazer upload da nova logo: ${uploadError.message}`);
        }

        // 3. Pega a URL pública da nova logo
        const { data: publicURLData } = supabase.storage
            .from('logo-loja')
            .getPublicUrl(filePath);
        
        // Adiciona a nova URL aos dados que serão salvos no banco
        finalUpdates.logo_url = publicURLData.publicUrl;
    }
    
    // 4. Atualiza a tabela 'lojas' com todas as informações
    const { data, error } = await supabase.from('lojas').update(finalUpdates).eq('id', lojaId).select().single(); // Adicionado .single() para retornar um objeto
    if (error) {
        throw new Error(`Falha ao atualizar os dados da loja: ${error.message}`);
    }
    return data; // Retorna o objeto diretamente
};


// --- Funções da API para Vendedores ---

export const fetchVendedores = async (lojaId: string) => {
    if (!lojaId) return [];
    const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .eq('loja_id', lojaId);
    if (error) {
        console.error('Erro ao buscar vendedores:', error);
        throw new Error('Falha ao buscar vendedores.');
    }
    return data;
};

export const createVendedor = async (vendedorData: any) => {
    const { data, error } = await supabase
        .from('vendedores')
        .insert(vendedorData)
        .select();
    if (error) {
        console.error('Erro ao criar vendedor:', error);
        throw new Error(`Falha ao adicionar vendedor: ${error.message}`);
    }
    return data[0];
};

export const deleteVendedor = async (vendedorId: string) => {
    const { error } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', vendedorId);
    if (error) {
        console.error('Erro ao deletar vendedor:', error);
        throw new Error('Falha ao deletar vendedor.');
    }
    return vendedorId;
};