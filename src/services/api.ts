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
    return data;
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

        const updatedImages = currentCar.imagens.filter((url: string) => url !== imageUrl);
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
    return data;
};

export const createClient = async ({ clientPayload, files, lojaId }: { clientPayload: ClientPayload; files: Files; lojaId: string; }) => {
    try {
        const chat_id = `web_${uuidv4()}`;
        const documentUrls: string[] = [];
        const tradeInUrls: string[] = [];
        
        if (files.documents && files.documents.length > 0) {
            for (const file of files.documents) {
                const filePath = `${lojaId}/${chat_id}/documents/${uuidv4()}-${file.name}`;
                await supabase.storage.from('client-documents').upload(filePath, file);
                const { data: publicURLData } = supabase.storage.from('client-documents').getPublicUrl(filePath);
                documentUrls.push(publicURLData.publicUrl);
            }
        }
        
        if (files.trade_in_photos && files.trade_in_photos.length > 0) {
            for (const file of files.trade_in_photos) {
                const filePath = `${lojaId}/${chat_id}/trade-in/${uuidv4()}-${file.name}`;
                await supabase.storage.from('trade-in-cars').upload(filePath, file);
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
    const { data, error } = await supabase.from('lojas').select('*').single();
    if (error) throw new Error('Falha ao buscar os dados da sua loja.');
    return data;
};

export const updateStoreDetails = async (lojaId: string, updates: any) => {
    const { data, error } = await supabase.from('lojas').update(updates).eq('id', lojaId).select();
    if (error) throw new Error(`Falha ao atualizar os dados da loja: ${error.message}`);
    return data[0];
};

