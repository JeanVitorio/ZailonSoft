// ===================================================================
// =================== ZailonSoft WhatsApp Bot v2.0 ==================
// =================== Integrado com Supabase ====================
// ===================================================================
const qrcode = require('qrcode');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// ===================================================================
// ================ CONFIGURAÇÃO OBRIGATÓRIA =========================
// ===================================================================
// PREENCHA COM SUAS CHAVES DO SUPABASE
const SUPABASE_URL = process.env.SUPABASE_URL || "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "SUA_CHAVE_ANON_PUBLICA";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "SUA_CHAVE_DE_SERVICO_(SERVICE_ROLE)";
// PREENCHA COM O USER_ID DO DONO DESTA INSTÂNCIA DO BOT
// Você encontra isso no Supabase em: Authentication > Users > User UID
const BOT_OWNER_USER_ID = process.env.BOT_OWNER_USER_ID || "SEU_USER_ID_DO_SUPABASE_AUTH";
// ===================================================================
// --- Inicialização do Supabase ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// --- Configuração de Pastas ---
const documentsFolder = path.join(__dirname, 'documents');
if (!fs.existsSync(documentsFolder)) {
    fs.mkdirSync(documentsFolder, { recursive: true });
}
// --- Variáveis de Estado do Bot ---
let isBotReady = false;
let storeData = {};
let carData = { modelos: [] };
let storeId = null;
// --- Funções Utilitárias ---
function getTimestamp() {
    return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
function parseCurrency(text) {
    if (!text) return 0;
    const cleanValue = text.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
}
function formatCurrency(value) {
    if (value === null || value === undefined) return 'N/A';
    return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function extractNumber(text) {
    if (!text) return null;
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const VOLTAR_KEYWORD = '(Digite *"voltar"* a qualquer momento para retornar ao passo anterior)';
// --- Funções de Carregamento de Dados do Supabase ---
async function loadStoreDataFromSupabase() {
    console.log(`[${getTimestamp()}] Buscando dados do estabelecimento no Supabase...`);
    const { data, error } = await supabaseAdmin.from('stores').select('*').eq('user_id', BOT_OWNER_USER_ID).single();
    if (error || !data) { console.error(`❌ CRÍTICO: Não foi possível carregar dados da loja. Erro:`, error?.message); process.exit(1); }
    storeData = { loja: { nome: data.name, atendente: data.attendant_name }, vendedores: data.sellers || [] };
    storeId = data.id;
    console.log(`[${getTimestamp()}] ✅ Dados da loja "${data.name}" carregados.`);
}
async function loadCarDataFromSupabase() {
    if (!storeId) { console.error("❌ Não é possível carregar carros sem um ID de loja."); return; }
    console.log(`[${getTimestamp()}] Buscando catálogo de veículos...`);
    const { data, error } = await supabaseAdmin.from('vehicles').select('*').eq('store_id', storeId);
    if (error) { console.error("❌ Erro ao buscar veículos:", error.message); return; }
    carData = { modelos: data.map(v => ({ nome: v.name, ano: v.year, preco: v.price, descricao: v.description, imagens: v.images || [] })) };
    console.log(`[${getTimestamp()}] ✅ ${data.length} veículos carregados.`);
}
// --- Configuração do Cliente WhatsApp ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    },
});
// --- Eventos do Cliente WhatsApp ---
client.on('qr', async (qr) => {
    console.log(`[${getTimestamp()}] QR Code gerado. Escaneie para autenticar.`);
    isBotReady = false;
    try {
        const qrCodeBuffer = await qrcode.toBuffer(qr);
        const fileName = `qrcodes/${BOT_OWNER_USER_ID}/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage.from('bot-assets').upload(fileName, qrCodeBuffer, { contentType: 'image/png', upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('bot-assets').getPublicUrl(fileName);
        const qrCodeUrl = publicUrlData.publicUrl;
        const { error: dbError } = await supabaseAdmin.from('bot_sessions').upsert({ user_id: BOT_OWNER_USER_ID, qr_code_url: qrCodeUrl, is_ready: false }, { onConflict: 'user_id' });
        if (dbError) throw dbError;
        console.log(`[${getTimestamp()}] ✅ QR Code salvo no Supabase. URL: ${qrCodeUrl}`);
    } catch (error) {
        console.error(`[${getTimestamp()}] ❌ Erro ao gerar ou salvar o QR Code:`, error.message);
    }
});
client.on('authenticated', () => {
    console.log(`[${getTimestamp()}] ✅ Sessão autenticada! Aguardando o bot ficar pronto...`);
});
client.on('auth_failure', msg => {
    console.error(`[${getTimestamp()}] ❌ FALHA DE AUTENTICAÇÃO:`, msg);
});
client.on('ready', async () => {
    console.log(`[${getTimestamp()}] ✅ Atendente Virtual está online e pronto para receber mensagens!`);
    isBotReady = true;
    const botNumber = client.info.wid.user;
    await supabaseAdmin.from('bot_sessions').update({ is_ready: true, qr_code_url: null, bot_number: botNumber }).eq('user_id', BOT_OWNER_USER_ID);
    try {
        await client.sendMessage(client.info.wid._serialized, `✅ *Bot Conectado!*\n*Horário:* ${getTimestamp()}`);
    } catch (e) { console.error("Erro ao enviar msg de confirmação:", e.message); }
});
client.on('disconnected', async (reason) => {
    console.log(`[${getTimestamp()}] ❌ Bot desconectado:`, reason);
    isBotReady = false;
    await supabaseAdmin.from('bot_sessions').update({ is_ready: false }).eq('user_id', BOT_OWNER_USER_ID);
    client.initialize().catch(err => console.error(`[${getTimestamp()}] Erro na reinicialização:`, err.message));
});
// =================================================================================
// ========================== LÓGICA PRINCIPAL DO CHATBOT ==========================
// =================================================================================
client.on('message', async (msg) => {
    const chatId = msg.from;
    const originalText = msg.body ? msg.body.trim() : '';
    if (!chatId.endsWith('@c.us') || msg.fromMe || originalText === 'prosseguir_interno' || originalText === 'estado_anterior_reativado') return;
    if (!isBotReady) {
        await client.sendMessage(chatId, 'Olá, estou me conectando. Por favor, envie sua mensagem novamente em instantes.');
        return;
    }
    try {
        await msg.getChat().then(chat => chat.sendStateTyping());
      
        let clientData = await getClientState(chatId, client);
        let currentState = clientData.bot_data.state || 'leed_recebido';
        if (normalizeText(originalText) === 'voltar') {
            const previousState = clientData.bot_data.previousState;
            if (previousState && previousState !== currentState) {
                console.log(`[${getTimestamp()}] Cliente ${chatId} voltando do estado ${currentState} para ${previousState}`);
                await client.sendMessage(chatId, 'Ok, retornando ao passo anterior.');
                await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: previousState, previousState: null } });
              
                const fakeMsg = { ...msg, body: 'estado_anterior_reativado' };
                client.emit('message', fakeMsg);
                return;
            } else {
                await client.sendMessage(chatId, 'Não há um passo anterior para retornar no momento.');
                return;
            }
        }
        const handleCarSearch = async (text) => {
            const matchedCars = await findCarByName(text);
            if (matchedCars && matchedCars.length === 1) {
                const car = matchedCars[0];
                console.log(`[${getTimestamp()}] Carro encontrado: ${car.nome}`);
                await sendCarDetailsAndAskForConfirmation(chatId, car, client);
            } else if (matchedCars && matchedCars.length > 1) {
                console.log(`[${getTimestamp()}] Múltiplos carros encontrados.`);
                await client.sendMessage(chatId, 'Encontrei alguns modelos que correspondem à sua busca. Qual deles você gostaria de ver?');
                await sleep(500);
                const carList = matchedCars.map(c => `• *${c.nome}*`).join('\n');
                await client.sendMessage(chatId, carList);
                await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_escolha_carro' } });
            } else {
                console.log(`[${getTimestamp()}] Nenhum carro encontrado.`);
                await client.sendMessage(chatId, 'Não encontrei esse modelo. Para facilitar, posso enviar a lista completa do nosso estoque.');
                await sleep(500);
                await sendCarList(chatId, client);
                await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_escolha_carro' } });
            }
        };
        switch (currentState) {
            case 'leed_recebido':
                const wantsList = detectInterestIntent(originalText);
                const isGreeting = detectGreetingIntent(originalText);
                if (wantsList === 'ver_lista') {
                    await client.sendMessage(chatId, `Olá! Eu sou o ${storeData.loja.atendente}, o assistente virtual da *${storeData.loja.nome}*.`);
                    await sleep(500);
                    await client.sendMessage(chatId, 'Certo. Buscando os carros em nosso estoque...');
                    await sleep(500);
                    await sendCarList(chatId, client);
                    await client.sendMessage(chatId, `Se algum veículo lhe interessar, por favor, me informe o nome do modelo. 😉`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_escolha_carro' } });
                } else if (isGreeting) {
                    await client.sendMessage(chatId, `Olá! Eu sou o ${storeData.loja.atendente}, o assistente virtual da *${storeData.loja.nome}*. Estou aqui para agilizar seu atendimento.`);
                    await sleep(500);
                    await client.sendMessage(chatId, `Já tem um veículo específico em mente ou prefere que eu envie uma lista com nosso estoque completo?`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_interesse' } });
                } else {
                    const matchedCars = await findCarByName(originalText);
                    if (matchedCars && matchedCars.length > 0) {
                        await client.sendMessage(chatId, `Olá! Eu sou o ${storeData.loja.atendente}. Notei seu interesse em um de nossos carros, vamos iniciar.`);
                        await handleCarSearch(originalText);
                    } else {
                        await client.sendMessage(chatId, `Olá! Eu sou o ${storeData.loja.atendente}, o assistente virtual da *${storeData.loja.nome}*. Estou aqui para agilizar seu atendimento.`);
                        await sleep(500);
                        await client.sendMessage(chatId, `Já tem um veículo específico em mente ou prefere que eu envie uma lista com nosso estoque completo?`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_interesse' } });
                    }
                }
                break;
            case 'aguardando_interesse':
                const isGreetingAgain = detectGreetingIntent(originalText);
                const wantsListAgain = detectInterestIntent(originalText);
                if (isGreetingAgain) {
                    await client.sendMessage(chatId, `Olá! Estou à sua disposição. Por favor, me diga o nome do veículo de seu interesse ou responda "lista" para ver nosso estoque. 😉`);
                } else if (wantsListAgain === 'ver_lista') {
                    await client.sendMessage(chatId, 'Certo. Buscando os carros em nosso estoque...');
                    await sleep(500);
                    await sendCarList(chatId, client);
                    await client.sendMessage(chatId, `Se algum veículo lhe interessar, por favor, me informe o nome do modelo. 😉`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_escolha_carro' } });
                } else {
                    await handleCarSearch(originalText);
                }
                break;
            case 'aguardando_escolha_carro':
                await handleCarSearch(originalText);
                break;
            case 'aguardando_confirmacao_veiculo':
                const confirmationIntent = detectConfirmationIntent(originalText);
                if (confirmationIntent === 'negar') {
                    await client.sendMessage(chatId, 'Sem problemas. Aqui está nossa lista de veículos novamente. Qual outro modelo lhe interessa?');
                    await sleep(500);
                    await sendCarList(chatId, client);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_escolha_carro', temp_car: null } });
                } else if (confirmationIntent === 'confirmar') {
                    await client.sendMessage(chatId, `Perfeito! Confirma a sua escolha pelo *${clientData.bot_data.temp_car.nome}*?`);
                    await sleep(500);
                    await client.sendMessage(chatId, `Como você gostaria de prosseguir com o pagamento?\n\n*1* - À vista\n*2* - Financiamento\n*3* - Tenho um carro para dar na troca\n*4* - Gostaria de agendar uma visita para ver o carro\n\n${VOLTAR_KEYWORD}`);
                    await updateClientState(chatId, {
                        bot_data: {
                            ...clientData.bot_data,
                            state: 'aguardando_opcao_pagamento',
                            interested_vehicles: [...(clientData.bot_data.interested_vehicles || []), clientData.bot_data.temp_car]
                        }
                    });
                } else {
                    await client.sendMessage(chatId, 'Não compreendi sua resposta. Por favor, responda "sim" para confirmar a escolha do veículo ou "não" para ver outro.');
                }
                break;
            case 'aguardando_opcao_pagamento':
                const paymentIntent = detectPaymentIntent(originalText);
                switch (paymentIntent) {
                    case 'a_vista':
                        await client.sendMessage(chatId, `Certo. Para prosseguirmos, qual o seu nome completo, por favor?\n\n${VOLTAR_KEYWORD}`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'a_vista_pede_nome' }, payment_method: 'a_vista', deal_type: 'venda' });
                        break;
                    case 'financiamento':
                        await client.sendMessage(chatId, `Certo, vamos fazer uma simulação de financiamento. O senhor(a) pretende dar algum valor de entrada? (Responda "sim" ou "não")\n\n${VOLTAR_KEYWORD}`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'financiamento_pede_entrada' }, payment_method: 'financiamento', deal_type: 'venda' });
                        break;
                    case 'troca':
                        await client.sendMessage(chatId, `Perfeito. Para iniciarmos a avaliação do seu veículo para a troca, qual o *modelo e ano* dele? (Ex: Fiat Uno 2018)\n\n${VOLTAR_KEYWORD}`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_modelo_carro' }, payment_method: 'troca', deal_type: 'troca' });
                        break;
                    case 'visita':
                        await client.sendMessage(chatId, `Excelente. Agendamentos de visita são feitos diretamente com nossos vendedores para garantir o melhor atendimento. Já estamos encaminhando seu contato.`);
                        await notifySalesTeam(chatId, `Cliente deseja agendar uma visita.`, client);
                        await resetClientState(chatId, client);
                        break;
                    default:
                        await client.sendMessage(chatId, 'Desculpe, não entendi. Por favor, escolha uma das opções: 1 (à vista), 2 (financiamento), 3 (troca) ou 4 (visita).');
                        break;
                }
                break;
            case 'troca_pede_modelo_carro':
                await updateClientState(chatId, {
                    bot_data: {
                        ...clientData.bot_data,
                        state: 'troca_pede_fotos',
                        trade_in_car: { ...clientData.bot_data.trade_in_car, modelo: originalText }
                    }
                });
                await client.sendMessage(chatId, `Certo. Agora, por favor, me envie *fotos* do seu veículo. (Frente, traseira, laterais e painel)\n\n${VOLTAR_KEYWORD}`);
                break;
              
            case 'troca_pede_fotos':
                if (msg.hasMedia) {
                    const localFilePath = await saveDocument(msg, 'trade_in_photo');
                    if (localFilePath) {
                        const newPhotos = [...(clientData.bot_data.trade_in_car.photos || []), localFilePath];
                        await updateClientState(chatId, {
                            bot_data: {
                                ...clientData.bot_data,
                                state: 'troca_pede_fotos_confirmacao',
                                trade_in_car: { ...clientData.bot_data.trade_in_car, photos: newPhotos }
                            }
                        });
                        await client.sendMessage(chatId, `Foto recebida. Deseja enviar mais fotos? (Responda "sim" ou "não")\n\n${VOLTAR_KEYWORD}`);
                    }
                } else {
                    await client.sendMessage(chatId, `Por favor, envie as fotos do veículo. Elas são necessárias para a avaliação. ${VOLTAR_KEYWORD}`);
                }
                break;
          
            case 'troca_pede_fotos_confirmacao':
                const fotosConfirmIntent = detectConfirmationIntent(originalText);
                if (fotosConfirmIntent === 'confirmar') {
                    await client.sendMessage(chatId, 'Ok, pode enviar a próxima foto.');
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_fotos' } });
                } else if (fotosConfirmIntent === 'negar') {
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_valor' } });
                    await client.sendMessage(chatId, `Entendido. Para concluirmos a coleta de dados, qual o valor que você gostaria de negociar pelo seu veículo?\n\n*Atenção:* O valor será analisado por nossa equipe de avaliação. Um valor muito acima do mercado pode não ser aceito. ${VOLTAR_KEYWORD}`);
                } else {
                    await client.sendMessage(chatId, 'Não compreendi. Gostaria de enviar mais fotos? (Responda "sim" ou "não")');
                }
                break;
            case 'troca_pede_valor':
                const valorDesejado = parseCurrency(originalText);
                const valorVeiculoLoja = parseCurrency(clientData.bot_data.temp_car.preco);
              
                if (valorDesejado > 0) {
                    await updateClientState(chatId, {
                        bot_data: {
                            ...clientData.bot_data,
                            state: 'troca_avalia_diferenca',
                            trade_in_car: { ...clientData.bot_data.trade_in_car, desired_value: valorDesejado }
                        }
                    });
                    const diferenca = valorVeiculoLoja - valorDesejado;
                    if (diferenca > 0) {
                        await client.sendMessage(chatId, `Certo. A diferença a ser paga pelo veículo da loja é de *${formatCurrency(diferenca)}*.`);
                        await sleep(500);
                        await client.sendMessage(chatId, `Como você deseja pagar essa diferença?\n\n*1* - À vista\n*2* - Financiamento\n\n${VOLTAR_KEYWORD}`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_forma_pagamento_diferenca' } });
                    } else {
                        await client.sendMessage(chatId, `Seu veículo está sendo avaliado. Nossos vendedores entrarão em contato para negociar as condições. Qual o seu nome completo para prosseguirmos?\n\n${VOLTAR_KEYWORD}`);
                        await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_nome_final' } });
                    }
                } else {
                    await client.sendMessage(chatId, `O valor informado é inválido. Por favor, digite o valor que você gostaria de negociar (ex: 35000).\n\n${VOLTAR_KEYWORD}`);
                }
                break;
            case 'troca_pede_forma_pagamento_diferenca':
                const diferencaPaymentIntent = detectPaymentIntent(originalText);
                if (diferencaPaymentIntent === 'a_vista') {
                    await client.sendMessage(chatId, `Entendido. Para agilizar, qual o seu nome completo, por favor?\n\n${VOLTAR_KEYWORD}`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_nome_final' } });
                } else if (diferencaPaymentIntent === 'financiamento') {
                    await client.sendMessage(chatId, `Perfeito. Nossos vendedores entrarão em contato para realizar a simulação do financiamento da diferença. Qual o seu nome completo para prosseguirmos?\n\n${VOLTAR_KEYWORD}`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'troca_pede_nome_final' } });
                } else {
                    await client.sendMessage(chatId, 'Não compreendi. Por favor, escolha entre "à vista" ou "financiamento".');
                }
                break;
          
            case 'troca_pede_nome_final':
                await updateClientState(chatId, { name: originalText, bot_data: { ...clientData.bot_data, state: 'finalizado_troca' } });
                await client.sendMessage(chatId, `Obrigado, ${originalText}. Todas as informações foram enviadas para nossa equipe de avaliadores. Eles entrarão em contato em breve para dar prosseguimento à negociação.🚀`);
                await notifySalesTeam(chatId, `Cliente iniciou processo de troca de veículo.`, client);
                await resetClientState(chatId, client);
                break;
            case 'a_vista_pede_nome':
                await updateClientState(chatId, { name: originalText, bot_data: { ...clientData.bot_data, state: 'finalizado' } });
                await client.sendMessage(chatId, `Obrigado, ${originalText}. Já estou passando seu contato para um de nossos vendedores. Ele entrará em contato em breve para finalizar a compra.🚀`);
                await notifySalesTeam(chatId, `Cliente optou por pagamento à vista.`, client);
                await resetClientState(chatId, client);
                break;
            case 'financiamento_pede_entrada':
                const entradaIntent = detectConfirmationIntent(originalText);
                if (entradaIntent === 'confirmar') {
                    await client.sendMessage(chatId, `Entendido. Qual o valor da entrada?\n\n${VOLTAR_KEYWORD}`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'financiamento_pede_valor_entrada' } });
                } else if (entradaIntent === 'negar') {
                    await client.sendMessage(chatId, 'Certo, sem entrada. A simulação será com o valor total do veículo.');
                    await sleep(500);
                    await updateClientState(chatId, {
                        bot_data: {
                            ...clientData.bot_data,
                            state: 'financiamento_confirma_documentos',
                            financing_details: { down_payment: 0 }
                        }
                    });
                    client.emit('message', { from: chatId, body: 'prosseguir_interno', getChat: msg.getChat });
                } else {
                    await client.sendMessage(chatId, 'Não compreendi. Você deseja dar um valor de entrada? (Responda "sim" ou "não")');
                }
                break;
            case 'financiamento_pede_valor_entrada':
                const valorEntrada = parseCurrency(originalText);
                const valorVeiculo = parseCurrency(clientData.bot_data.temp_car.preco);
                if (valorEntrada > 0 && valorEntrada < valorVeiculo) {
                    const valorAFinanciar = valorVeiculo - valorEntrada;
                    await client.sendMessage(chatId, `Certo. Com uma entrada de ${formatCurrency(valorEntrada)}, o valor a ser financiado será de *${formatCurrency(valorAFinanciar)}*. Confirma?`);
                    await updateClientState(chatId, {
                        bot_data: {
                            ...clientData.bot_data,
                            state: 'financiamento_confirma_documentos',
                            financing_details: { down_payment: valorEntrada, amount_to_finance: valorAFinanciar }
                        }
                    });
                } else {
                    await client.sendMessage(chatId, `O valor da entrada parece inválido ou é maior que o valor do carro. Por favor, informe um valor correto.\n\n${VOLTAR_KEYWORD}`);
                }
                break;
            case 'financiamento_confirma_documentos':
                const docsConfirm = detectConfirmationIntent(originalText);
                if (docsConfirm === 'confirmar') {
                    await client.sendMessage(chatId, `Ótimo! Para darmos início à sua simulação, precisarei de alguns dados. Serão necessários:\n- Nome Completo\n- CPF e RG\n- Foto do seu Comprovante de Renda\n- Foto do seu RG ou CNH\n\nVocê tem esses documentos em mãos e deseja prosseguir agora?`);
                    await sleep(500);
                    await client.sendMessage(chatId, `Temos opções de 12x, 24x, 36x, 48x e 60x. Em quantas vezes você gostaria de simular?\n\n${VOLTAR_KEYWORD}`);
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'financiamento_pede_parcelas' } });
                } else if (docsConfirm === 'negar') {
                    await client.sendMessage(chatId, 'Tudo bem. Quando estiver com os documentos prontos, é só me chamar. Se quiser, podemos explorar outra forma de pagamento ou ver outro carro.');
                    await updateClientState(chatId, { bot_data: { ...clientData.bot_data, state: 'aguardando_opcao_pagamento' } });
                } else {
                    await client.sendMessage(chatId, 'Não compreendi. Por favor, responda "sim" para continuar ou "não" para ver outras opções.');
                }
                break;
            case 'financiamento_pede_parcelas':
                const installments = extractNumber(originalText);
                const validInstallments = [12, 24, 36, 48, 60];
                if (installments && validInstallments.includes(installments)) {
                    await updateClientState(chatId, {
                        bot_data: {
                            ...clientData.bot_data,
                            state: 'financiamento_pede_nome',
                            financing_details: { ...clientData.bot_data.financing_details, installments: `${installments}x` }
                        }
                    });
                    await client.sendMessage(chatId, `Entendido, simulação para ${installments}x. Agora, qual o seu nome completo?\n\n${VOLTAR_KEYWORD}`);
                } else {
                    await client.sendMessage(chatId, `Não compreendi ou a opção não é válida. Por favor, escolha entre 12, 24, 36, 48 ou 60 vezes.\n\n${VOLTAR_KEYWORD}`);
                }
                break;
            case 'financiamento_pede_nome':
                await updateClientState(chatId, { name: originalText, bot_data: { ...clientData.bot_data, state: 'financiamento_pede_job' } });
                await client.sendMessage(chatId, `Qual a sua profissão ou cargo atual?\n\n${VOLTAR_KEYWORD}`);
                break;
            case 'financiamento_pede_job':
                await updateClientState(chatId, { job: originalText, bot_data: { ...clientData.bot_data, state: 'financiamento_pede_cpf' } });
                await client.sendMessage(chatId, `Agradeço. Por favor, me informe seu CPF (apenas números).\n\n${VOLTAR_KEYWORD}`);
                break;
            case 'financiamento_pede_cpf':
                if (/^\d{11}$/.test(originalText)) {
                    await updateClientState(chatId, { cpf: originalText, bot_data: { ...clientData.bot_data, state: 'financiamento_pede_rg' } });
                    await client.sendMessage(chatId, `CPF recebido. E qual o seu RG? (apenas números)\n\n${VOLTAR_KEYWORD}`);
                } else {
                    await client.sendMessage(chatId, 'CPF inválido. Por favor, informe os 11 dígitos, sem pontos ou traços.');
                }
                break;
            case 'financiamento_pede_rg':
                await updateClientState(chatId, { rg_number: originalText, bot_data: { ...clientData.bot_data, state: 'financiamento_pede_comprovante_renda' } });
                await client.sendMessage(chatId, `Ótimo. Agora preciso de uma foto do seu comprovante de renda mais recente.\n\n${VOLTAR_KEYWORD}`);
                break;
            case 'financiamento_pede_comprovante_renda':
                if (msg.hasMedia) {
                    const localFilePath = await saveDocument(msg, 'comprovante_renda');
                    if (localFilePath) {
                        await updateClientState(
                            chatId,
                            { bot_data: { ...clientData.bot_data, state: 'financiamento_pede_foto_rg' } },
                            { incomeProof: localFilePath }
                        );
                        await client.sendMessage(chatId, `Comprovante recebido. Por último, envie uma foto do seu RG ou CNH (frente e verso, se possível).\n\n${VOLTAR_KEYWORD}`);
                    }
                } else {
                    await client.sendMessage(chatId, 'Por favor, envie o comprovante como uma imagem ou PDF.');
                }
                break;
            case 'financiamento_pede_foto_rg':
                if (msg.hasMedia) {
                    const localFilePath = await saveDocument(msg, 'rg');
                    if (localFilePath) {
                        await updateClientState(
                            chatId,
                            { bot_data: { ...clientData.bot_data, state: 'finalizado' } },
                            { rg_photo: localFilePath }
                        );
                        await client.sendMessage(chatId, `Tudo certo! Recebi a documentação. Suas informações foram enviadas para uma pré-análise de crédito. Um de nossos vendedores entrará em contato em breve com o resultado da simulação e os próximos passos. Agradecemos o contato.`);
                        await notifySalesTeam(chatId, `Cliente enviou dados para análise de financiamento.`, client);
                        await resetClientState(chatId, client);
                    }
                } else {
                    await client.sendMessage(chatId, 'Por favor, envie a foto do seu documento.');
                }
                break;
            default:
                console.warn(`[${getTimestamp()}] Estado desconhecido ou reativado: ${currentState} for ${chatId}`);
                break;
        }
    } catch (error) {
        console.error(`[${getTimestamp()}] 💥 Erro CRÍTICO ao processar mensagem de ${chatId}:`, error);
        await client.sendMessage(chatId, 'Ocorreu um erro inesperado em nosso sistema. Já notificamos a equipe responsável. Por favor, tente novamente mais tarde.');
        await resetClientState(chatId, client).catch(resetErr => {
            console.error(`[${getTimestamp()}] Falha CRÍTICA ao resetar o estado do cliente após um erro:`, resetErr);
        });
    }
});
// ===============================================================================
// ======================= FIM DA LÓGICA PRINCIPAL DO CHATBOT ======================
// ===============================================================================
// ===============================================================================
// ======== FUNÇÕES DE DADOS (INTEGRAÇÃO DIRETA COM SUPABASE) ========
// ===============================================================================
async function getClientState(chatId, clientInstance) {
    const { data, error } = await supabaseAdmin.from('clients').select('*').eq('chat_id', chatId).single();
    if (error && error.code !== 'PGRST116') { console.error("Erro ao buscar cliente:", error.message); throw error; }
    if (data) { data.bot_data = data.bot_data || { state: 'leed_recebido' }; return data; }
  
    console.log(`[${getTimestamp()}] Cliente ${chatId} não encontrado. Criando...`);
    const contact = await clientInstance.getContactById(chatId);
    const newClientPayload = { chat_id: chatId, name: contact.pushname || `Cliente ${contact.number}`, phone: contact.number, bot_data: { state: 'leed_recebido' }, store_id: storeId };
    const { data: newClient, error: createError } = await supabaseAdmin.from('clients').insert(newClientPayload).select().single();
    if (createError) { console.error("Erro ao criar cliente:", createError.message); throw createError; }
    return newClient;
}
async function updateClientState(chatId, textData, filesToUpload = {}) {
    const { data: currentClient, error: findError } = await supabaseAdmin.from('clients').select('bot_data').eq('chat_id', chatId).single();
    if (findError) { console.error("Erro ao buscar cliente para update:", findError.message); throw findError; }
  
    const currentState = currentClient.bot_data?.state;
    const newBotStateData = textData.bot_data || currentClient.bot_data;
    const newProposedState = newBotStateData.state || currentState;
    if (newProposedState !== currentState) {
        newBotStateData.previousState = currentState;
    }
    const finalBotData = { ...currentClient.bot_data, ...newBotStateData };
    textData.bot_data = finalBotData;
  
    if (Object.keys(filesToUpload).length > 0) {
        for (const fieldName in filesToUpload) {
            textData[fieldName] = filesToUpload[fieldName];
        }
    }
  
    const { error } = await supabaseAdmin.from('clients').update(textData).eq('chat_id', chatId);
    if (error) { console.error("Erro ao atualizar cliente:", error.message); throw error; }
    console.log(`[${getTimestamp()}] Cliente ${chatId} atualizado com sucesso no Supabase.`);
}
async function resetClientState(chatId, client) {
    const clientData = await getClientState(chatId, client);
    await updateClientState(chatId, {
        bot_data: {
            ...clientData.bot_data,
            state: 'leed_recebido',
            previousState: null,
            temp_car: null,
            financing_details: {},
            trade_in_car: {}
        }
    });
}
// ===============================================================================
// =================== FIM DAS FUNÇÕES DE DADOS (INTEGRAÇÃO SUPABASE) ===================
// ===============================================================================
// ===============================================================================
// ========================= FUNÇÕES AUXILIARES DO CHATBOT =========================
// ===============================================================================
function normalizeText(text = '') {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
}
function textContainsAny(text, keywords) {
    if (!text || !keywords) return false;
    return keywords.some(keyword => text.includes(keyword));
}
function detectGreetingIntent(text) {
    const normalized = normalizeText(text);
    const keywords = ['oi', 'ola', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'tudo bem', 'tudo bom'];
    return keywords.includes(normalized);
}
function detectInterestIntent(text) {
    const normalized = normalizeText(text);
    const verListaKeywords = ['lista', 'estoque', 'todos', 'quais carros', 'ver todos', 'modelos', 'opcoes', 'sim', 'pode mandar', 'manda', 'manda ai', 'pode ser', 'claro', 'quero ver', 'mostra', 'quais sao', 'pode enviar', 'envia', 'aceito'];
    if (textContainsAny(normalized, verListaKeywords)) return 'ver_lista';
    return 'nome_especifico';
}
function detectConfirmationIntent(text) {
    const normalized = normalizeText(text);
    const negarKeywords = ['nao', 'negativo', 'outro', 'ver outro', 'lista', 'diferente', 'nao gostei', 'nao quero', 'novo valor', 'não'];
    const confirmarKeywords = ['sim', 'quero', 'prosseguir', 'esse', 'confirmar', 'manda', 'bora', 'pode ser', 'gostei', 'afirmativo', 'isso', 'segue o baile', 'continuar', 'pode continuar', 'blz', 'beleza', 'ok', 'certo', 'exato'];
    if (textContainsAny(normalized, negarKeywords)) return 'negar';
    if (textContainsAny(normalized, confirmarKeywords)) return 'confirmar';
    return null;
}
function detectPaymentIntent(text) {
    const normalized = normalizeText(text);
    if (textContainsAny(normalized, ['1', 'vista', 'a vista', 'dinheiro'])) return 'a_vista';
    if (textContainsAny(normalized, ['2', 'financiar', 'financiamento', 'parcelado', 'parcelar', 'financia'])) return 'financiamento';
    if (textContainsAny(normalized, ['3', 'troca', 'trocar', 'brique', 'meu carro', 'negocio'])) return 'troca';
    if (textContainsAny(normalized, ['4', 'visita', 'visitar', 'ver o carro', 'ir na loja', 'agendar'])) return 'visita';
    return null;
}
async function findCarByName(userInput) {
    try {
        const cars = carData.modelos;
        if (!cars || !Array.isArray(cars) || !userInput) return [];
        const normalizedInput = normalizeText(userInput);
        if (normalizedInput.length < 3) return [];
        const userInputKeywords = normalizedInput.split(' ').filter(word => word.length >= 2);
        if (userInputKeywords.length === 0) return [];
        return cars.filter(car => {
            if (!car || typeof car.nome !== 'string') return false;
            const carNameNormalized = normalizeText(car.nome);
            const allKeywordsMatch = userInputKeywords.every(keyword => carNameNormalized.includes(keyword));
            if (allKeywordsMatch) return true;
            const carNameKeywords = carNameNormalized.split(' ').filter(word => word.length >= 2);
            return userInputKeywords.some(uKeyword => carNameKeywords.includes(uKeyword));
        });
    } catch (error) {
        console.error(`[${getTimestamp()}] Erro ao buscar carro por nome:`, error.message);
        return [];
    }
}
async function sendCarList(chatId, client) {
    try {
        const cars = carData;
        if (cars && cars.modelos && cars.modelos.length > 0) {
            const carList = cars.modelos.map(c => `• *${c.nome}* - ${c.preco || 'Sob consulta'}`).join('\n');
            await client.sendMessage(chatId, `Esses são os carros que temos no momento:\n\n${carList}`);
        } else {
            await client.sendMessage(chatId, 'Lamentamos, mas estamos sem carros no estoque no momento. Por favor, retorne mais tarde!');
        }
    } catch (error) {
        console.error(`[${getTimestamp()}] Erro ao montar a lista de carros:`, error.message);
        await client.sendMessage(chatId, 'Ocorreu um erro ao buscar os carros. Por favor, tente novamente em alguns minutos. 😓');
    }
}
async function sendCarDetailsAndAskForConfirmation(chatId, car, client) {
    const clientData = await getClientState(chatId, client);
    await updateClientState(chatId, {
        bot_data: {
            ...clientData.bot_data,
            state: 'aguardando_confirmacao_veiculo',
            temp_car: car
        }
    });
    let carDetails = `*Modelo:* ${car.nome}\n*Ano:* ${car.ano || 'N/A'}\n*Preço:* ${formatCurrency(car.preco) || 'Sob consulta'}\n*Descrição:* ${car.descricao || 'N/A'}`;
    await client.sendMessage(chatId, `Ótima escolha! Aqui estão os detalhes do *${car.nome}*:`);
    if (car.imagens && car.imagens.length > 0) {
        for (const imagePath of car.imagens) {
            try {
                const media = await MessageMedia.fromUrl(imagePath, { unsafeMime: true });
                await client.sendMessage(chatId, media);
            } catch (e) {
                console.error(`[${getTimestamp()}] Erro ao carregar imagem da URL: ${imagePath}`, e.message);
            }
        }
    }
    await client.sendMessage(chatId, carDetails);
    await client.sendMessage(chatId, `Gostaria de prosseguir com a compra deste veículo? (Responda "sim" ou "não")`);
}
async function saveDocument(msg, prefix) {
    try {
        const media = await msg.downloadMedia();
        if (!media) return null;
        const fileExtension = media.mimetype.split('/')[1] || 'bin';
        const filename = `${prefix}_${Date.now()}.${fileExtension}`;
        const userDocPath = path.join(documentsFolder, msg.from);
        if (!fs.existsSync(userDocPath)) fs.mkdirSync(userDocPath, { recursive: true });
        const filePath = path.join(userDocPath, filename);
        fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));
        console.log(`[${getTimestamp()}] Documento salvo temporariamente em: ${filePath}`);
        // Upload to Supabase
        const { data, error } = await supabase.storage.from('documents').upload(`${msg.from}/${filename}`, fs.createReadStream(filePath), { contentType: media.mimetype });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(`${msg.from}/${filename}`);
        fs.unlinkSync(filePath); // Clean up local file
        return publicUrlData.publicUrl;
    } catch (error) {
        console.error(`[${getTimestamp()}] Erro ao salvar documento:`, error.message);
        return null;
    }
}
async function notifySalesTeam(customerChatId, message, client) {
    const salesTeamNumbers = storeData.vendedores.map(v => v.whatsapp).filter(Boolean);
    if (salesTeamNumbers.length === 0) {
        console.warn(`[${getTimestamp()}] ⚠️ Nenhum vendedor encontrado para notificar.`);
        return;
    }
    const finalClientData = await getClientState(customerChatId, client);
    const safeDataForLog = { ...finalClientData };
    if (safeDataForLog.cpf) safeDataForLog.cpf = '***';
    delete safeDataForLog.bot_data;
    let report = `🔔 *NOVA OPORTUNIDADE (BOT ${storeData.loja.atendente})* 🔔\n\n*Cliente:* ${finalClientData.name || finalClientData.phone} (${customerChatId})\n*Status:* ${message}\n\n*Resumo do Atendimento:*\n`;
    report += `\`\`\`${JSON.stringify(safeDataForLog, null, 2)}\`\`\``;
    for (const number of salesTeamNumbers) {
        try {
            await client.sendMessage(number, report);
            // Send documents if any
            const allDocs = [];
            if (finalClientData.incomeProof) allDocs.push(finalClientData.incomeProof);
            if (finalClientData.rg_photo) allDocs.push(finalClientData.rg_photo);
            if (finalClientData.bot_data.trade_in_car && finalClientData.bot_data.trade_in_car.photos) allDocs.push(...finalClientData.bot_data.trade_in_car.photos);
            if (allDocs.length > 0) {
                await client.sendMessage(number, "Anexos do cliente:");
                for (const docUrl of allDocs) {
                    const media = await MessageMedia.fromUrl(docUrl);
                    await client.sendMessage(number, media, { caption: `Anexo de ${finalClientData.name}` });
                }
            }
        } catch (error) {
            console.error(`[${getTimestamp()}] Erro ao notificar vendedor ${number}:`, error.message);
        }
    }
}
// ===============================================================================
// ============================= INICIALIZAÇÃO ===================================
// ===============================================================================
async function startBot() {
    console.log(`[${getTimestamp()}] Iniciando o bot...`);
    await loadStoreDataFromSupabase();
    await loadCarDataFromSupabase();
    client.initialize().catch(err => {
        console.error(`[${getTimestamp()}] ❌ Erro fatal ao inicializar o cliente:`, err.message);
    });
}
startBot();