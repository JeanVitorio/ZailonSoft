import { TaskDifficulty } from '@/types/zailon';

export interface QuestTemplate {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  duracao_dias: number;
  categoria: string;
  tasks: QuestTaskTemplate[];
}

export interface QuestTaskTemplate {
  titulo: string;
  descricao: string;
  dificuldade: TaskDifficulty;
  horario: string;
  frequencia: 'daily' | 'weekly';
  dias_semana: number[];
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'secar-barriga-30', titulo: 'Secar a Barriga em 30 Dias', descricao: 'Programa intensivo para definição abdominal com exercícios diários progressivos.',
    emoji: '🔥', duracao_dias: 30, categoria: 'Fitness',
    tasks: [
      { titulo: '20 abdominais', descricao: 'Série de abdominais completos', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: '15 min de cardio', descricao: 'Corrida leve ou polichinelos', dificuldade: 'easy', horario: '07:30', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: '3 séries de prancha (30s)', descricao: 'Prancha frontal e laterais', dificuldade: 'medium', horario: '08:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Treino HIIT 20min', descricao: 'Circuito alta intensidade', dificuldade: 'medium', horario: '18:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Evitar açúcar refinado', descricao: 'Sem doces, refrigerante ou suco de caixinha', dificuldade: 'medium', horario: '12:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Treino pesado de core', descricao: 'Bicycle crunch + leg raise + mountain climber', dificuldade: 'hard', horario: '19:00', frequencia: 'daily', dias_semana: [2,4,6] },
      { titulo: 'Correr 5km', descricao: 'Corrida contínua ao ar livre', dificuldade: 'hard', horario: '06:00', frequencia: 'weekly', dias_semana: [6] },
    ],
  },
  {
    id: 'caminhada-diaria', titulo: 'Hábito de Caminhar', descricao: 'Construa o hábito de caminhar todos os dias para saúde física e mental.',
    emoji: '🚶', duracao_dias: 60, categoria: 'Saúde',
    tasks: [
      { titulo: 'Caminhada de 15 min', descricao: 'Caminhada leve no bairro', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Alongamento pós-caminhada', descricao: '5 min de alongamento básico', dificuldade: 'easy', horario: '07:20', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Caminhada de 30 min', descricao: 'Ritmo moderado', dificuldade: 'medium', horario: '06:30', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Registrar passos do dia', descricao: 'Anotar quantos passos andou', dificuldade: 'easy', horario: '21:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Caminhada 45min + inclinação', descricao: 'Subir ladeiras ou usar esteira inclinada', dificuldade: 'medium', horario: '06:00', frequencia: 'daily', dias_semana: [2,4] },
      { titulo: 'Caminhada 1h no parque', descricao: 'Caminhada longa ao ar livre', dificuldade: 'hard', horario: '06:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Trekking leve', descricao: 'Trilha em terreno irregular', dificuldade: 'hard', horario: '07:00', frequencia: 'weekly', dias_semana: [6] },
    ],
  },
  {
    id: 'alimentacao-saudavel', titulo: 'Alimentação Saudável', descricao: 'Mude sua relação com a comida em 30 dias.',
    emoji: '🥗', duracao_dias: 30, categoria: 'Nutrição',
    tasks: [
      { titulo: 'Beber 2L de água', descricao: 'Distribuir ao longo do dia', dificuldade: 'easy', horario: '08:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Comer 1 fruta', descricao: 'Incluir fruta no lanche', dificuldade: 'easy', horario: '10:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Refeição sem ultraprocessado', descricao: 'Almoço com comida de verdade', dificuldade: 'medium', horario: '12:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Preparar marmita', descricao: 'Cozinhar sua própria comida', dificuldade: 'medium', horario: '20:00', frequencia: 'daily', dias_semana: [0,3] },
      { titulo: 'Jantar leve até 20h', descricao: 'Evitar comer pesado à noite', dificuldade: 'medium', horario: '19:30', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Planejar cardápio semanal', descricao: 'Montar as refeições da semana', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Dia sem açúcar total', descricao: 'Zero açúcar adicionado o dia inteiro', dificuldade: 'hard', horario: '07:00', frequencia: 'daily', dias_semana: [1,4] },
    ],
  },
  {
    id: 'exercicio-em-casa', titulo: 'Treino em Casa', descricao: 'Rotina de exercícios sem equipamento, feita no conforto de casa.',
    emoji: '💪', duracao_dias: 45, categoria: 'Fitness',
    tasks: [
      { titulo: '10 flexões', descricao: 'Flexões no chão ou apoiadas', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: '20 agachamentos', descricao: 'Agachamento livre', dificuldade: 'easy', horario: '07:10', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Circuito de 20min', descricao: 'Flexão + agachamento + prancha + burpee', dificuldade: 'medium', horario: '07:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Yoga 15min', descricao: 'Sessão de yoga para flexibilidade', dificuldade: 'medium', horario: '06:30', frequencia: 'daily', dias_semana: [2,4,6] },
      { titulo: 'Alongamento completo', descricao: '10min de alongamento full body', dificuldade: 'easy', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Treino AMRAP 30min', descricao: 'Máximo de rounds possível', dificuldade: 'hard', horario: '18:00', frequencia: 'daily', dias_semana: [2,5] },
      { titulo: '100 burpees', descricao: 'Dividir em séries ao longo do dia', dificuldade: 'hard', horario: '08:00', frequencia: 'weekly', dias_semana: [6] },
    ],
  },
  {
    id: 'meditacao', titulo: 'Meditação & Mindfulness', descricao: 'Desenvolva clareza mental e controle emocional.',
    emoji: '🧘', duracao_dias: 30, categoria: 'Mental',
    tasks: [
      { titulo: 'Respiração 4-7-8 (2min)', descricao: 'Técnica de respiração calmante', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Meditação guiada 5min', descricao: 'Use um app ou YouTube', dificuldade: 'easy', horario: '07:05', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Body scan 10min', descricao: 'Escaneamento corporal consciente', dificuldade: 'medium', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Journaling matinal', descricao: 'Escreva 3 coisas pelas quais é grato', dificuldade: 'medium', horario: '06:30', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Meditação silenciosa 15min', descricao: 'Sem guia, apenas presença', dificuldade: 'medium', horario: '06:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Retiro pessoal 1h', descricao: '1h sem celular, em silêncio total', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Meditação 30min', descricao: 'Sessão longa de meditação profunda', dificuldade: 'hard', horario: '05:30', frequencia: 'daily', dias_semana: [6] },
    ],
  },
  {
    id: 'leitura-diaria', titulo: 'Ler 1 Livro por Mês', descricao: 'Crie o hábito de leitura diária e expanda seu conhecimento.',
    emoji: '📚', duracao_dias: 30, categoria: 'Conhecimento',
    tasks: [
      { titulo: 'Ler 10 páginas', descricao: 'Leitura mínima do dia', dificuldade: 'easy', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Anotar 1 insight', descricao: 'Escreva algo que aprendeu', dificuldade: 'easy', horario: '22:15', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Ler 30 páginas', descricao: 'Sessão de leitura mais longa', dificuldade: 'medium', horario: '20:00', frequencia: 'daily', dias_semana: [6,0] },
      { titulo: 'Resumir capítulo', descricao: 'Escreva um resumo do que leu', dificuldade: 'medium', horario: '22:30', frequencia: 'daily', dias_semana: [3] },
      { titulo: 'Compartilhar aprendizado', descricao: 'Conte a alguém o que aprendeu', dificuldade: 'medium', horario: '19:00', frequencia: 'weekly', dias_semana: [5] },
      { titulo: 'Ler 50 páginas', descricao: 'Maratona de leitura', dificuldade: 'hard', horario: '14:00', frequencia: 'weekly', dias_semana: [6] },
      { titulo: 'Resenha completa do livro', descricao: 'Escreva uma resenha detalhada', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
  {
    id: 'dormir-melhor', titulo: 'Dormir Melhor', descricao: 'Otimize sua rotina de sono para máxima recuperação.',
    emoji: '😴', duracao_dias: 21, categoria: 'Saúde',
    tasks: [
      { titulo: 'Desligar telas 22h', descricao: 'Celular e TV fora 1h antes de dormir', dificuldade: 'easy', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Chá relaxante', descricao: 'Camomila ou cidreira antes de dormir', dificuldade: 'easy', horario: '22:30', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Deitar até 23h', descricao: 'Estar na cama no horário', dificuldade: 'medium', horario: '23:00', frequencia: 'daily', dias_semana: [0,1,2,3,4] },
      { titulo: 'Acordar sem soneca', descricao: 'Levantar no primeiro alarme', dificuldade: 'medium', horario: '06:30', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Registrar qualidade do sono', descricao: 'Nota de 1-10 para como dormiu', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Sem cafeína após 14h', descricao: 'Cortar café, energético e chá preto', dificuldade: 'hard', horario: '14:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Dormir 8h completas', descricao: 'Garantir noite completa de sono', dificuldade: 'hard', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4] },
    ],
  },
  {
    id: 'produtividade', titulo: 'Produtividade Máxima', descricao: 'Domine seu tempo e energia com técnicas comprovadas.',
    emoji: '⚡', duracao_dias: 30, categoria: 'Carreira',
    tasks: [
      { titulo: 'Planejar 3 prioridades', descricao: 'Defina as 3 tarefas mais importantes', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Pomodoro 25min', descricao: '1 ciclo focado sem distrações', dificuldade: 'easy', horario: '09:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: '2h de deep work', descricao: 'Trabalho focado sem interrupções', dificuldade: 'medium', horario: '08:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Inbox zero', descricao: 'Limpar todas as mensagens e emails', dificuldade: 'medium', horario: '17:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Review semanal', descricao: 'Analisar o que fez e planejar próxima semana', dificuldade: 'medium', horario: '18:00', frequencia: 'weekly', dias_semana: [5] },
      { titulo: 'Dia sem redes sociais', descricao: 'Zero scroll em redes o dia inteiro', dificuldade: 'hard', horario: '07:00', frequencia: 'weekly', dias_semana: [3] },
      { titulo: '4h de deep work', descricao: 'Manhã inteira em modo focado', dificuldade: 'hard', horario: '06:00', frequencia: 'daily', dias_semana: [2,4] },
    ],
  },
  {
    id: 'aprender-idioma', titulo: 'Aprender um Novo Idioma', descricao: 'Estude um idioma novo com consistência diária.',
    emoji: '🌍', duracao_dias: 90, categoria: 'Conhecimento',
    tasks: [
      { titulo: '10min de app de idiomas', descricao: 'Duolingo, Babbel ou similar', dificuldade: 'easy', horario: '08:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Aprender 5 palavras novas', descricao: 'Vocabulário novo com flashcards', dificuldade: 'easy', horario: '12:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Ouvir podcast no idioma', descricao: '15min de listening prático', dificuldade: 'medium', horario: '13:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Escrever 5 frases', descricao: 'Praticar escrita no idioma', dificuldade: 'medium', horario: '20:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Assistir série com legenda', descricao: '20min de conteúdo no idioma alvo', dificuldade: 'medium', horario: '21:00', frequencia: 'daily', dias_semana: [2,4,6] },
      { titulo: 'Conversar com nativo', descricao: 'Prática de conversação real', dificuldade: 'hard', horario: '19:00', frequencia: 'weekly', dias_semana: [6] },
      { titulo: 'Redação 1 página', descricao: 'Escrever texto longo no idioma', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
  {
    id: 'controle-financeiro', titulo: 'Controle Financeiro', descricao: 'Organize suas finanças e construa hábitos de economia.',
    emoji: '💰', duracao_dias: 30, categoria: 'Finanças',
    tasks: [
      { titulo: 'Anotar gastos do dia', descricao: 'Registrar cada gasto em planilha', dificuldade: 'easy', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Verificar saldo', descricao: 'Checar conta bancária', dificuldade: 'easy', horario: '08:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Não gastar com supérfluos', descricao: 'Evitar compras por impulso', dificuldade: 'medium', horario: '09:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Guardar R$10', descricao: 'Separar valor para poupança', dificuldade: 'medium', horario: '08:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Revisar assinaturas', descricao: 'Cancelar o que não usa', dificuldade: 'medium', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Fechamento semanal', descricao: 'Analisar gastos vs orçamento', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Planejar orçamento mensal', descricao: 'Distribuir renda em categorias', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
  {
    id: 'skincare', titulo: 'Rotina de Skincare', descricao: 'Cuide da sua pele com uma rotina diária consistente.',
    emoji: '✨', duracao_dias: 30, categoria: 'Autocuidado',
    tasks: [
      { titulo: 'Lavar o rosto (manhã)', descricao: 'Sabonete facial adequado', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Passar protetor solar', descricao: 'FPS 30+ todo dia', dificuldade: 'easy', horario: '07:10', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Rotina noturna completa', descricao: 'Limpar + tonificar + hidratar', dificuldade: 'medium', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Beber 2L de água', descricao: 'Hidratação de dentro pra fora', dificuldade: 'medium', horario: '08:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Máscara facial', descricao: 'Tratamento semanal', dificuldade: 'easy', horario: '20:00', frequencia: 'weekly', dias_semana: [0] },
      { titulo: 'Esfoliação', descricao: 'Esfoliar rosto e corpo', dificuldade: 'hard', horario: '20:00', frequencia: 'weekly', dias_semana: [3] },
      { titulo: 'Avaliar progresso da pele', descricao: 'Tirar foto e comparar', dificuldade: 'hard', horario: '10:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
  {
    id: 'reduzir-estresse', titulo: 'Reduzir o Estresse', descricao: 'Técnicas práticas para controlar ansiedade e estresse.',
    emoji: '🧠', duracao_dias: 21, categoria: 'Mental',
    tasks: [
      { titulo: 'Respiração profunda 3min', descricao: 'Pare e respire conscientemente', dificuldade: 'easy', horario: '09:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Caminhar 10min', descricao: 'Caminhada leve para clarear a mente', dificuldade: 'easy', horario: '12:30', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Desconectar 1h', descricao: 'Sem celular por 1 hora', dificuldade: 'medium', horario: '20:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Escrever sobre o dia', descricao: 'Journaling de descompressão', dificuldade: 'medium', horario: '22:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Ouvir música relaxante 20min', descricao: 'Playlist calma, sem celular', dificuldade: 'easy', horario: '21:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Banho frio 3min', descricao: 'Exposição ao frio para reset mental', dificuldade: 'hard', horario: '07:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Dia offline completo', descricao: 'Um dia inteiro sem internet', dificuldade: 'hard', horario: '07:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
  {
    id: 'acordar-cedo', titulo: 'Acordar às 5h da Manhã', descricao: 'Entre no clube das 5h e ganhe horas produtivas.',
    emoji: '⏰', duracao_dias: 21, categoria: 'Disciplina',
    tasks: [
      { titulo: 'Alarme às 5h', descricao: 'Colocar alarme e levantar', dificuldade: 'medium', horario: '05:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Não apertar soneca', descricao: 'Levantar no primeiro toque', dificuldade: 'easy', horario: '05:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Banho gelado ao acordar', descricao: 'Despertar total com água fria', dificuldade: 'hard', horario: '05:10', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Café da manhã até 6h', descricao: 'Alimentar-se bem cedo', dificuldade: 'easy', horario: '05:30', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Rotina matinal 1h', descricao: 'Exercício + leitura + planejamento', dificuldade: 'medium', horario: '05:15', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Deitar até 22h', descricao: 'Garantir 7h de sono', dificuldade: 'medium', horario: '22:00', frequencia: 'daily', dias_semana: [0,1,2,3,4] },
      { titulo: 'Acordar 5h no fim de semana', descricao: 'Manter consistência', dificuldade: 'hard', horario: '05:00', frequencia: 'daily', dias_semana: [6,0] },
    ],
  },
  {
    id: 'networking', titulo: 'Expandir Networking', descricao: 'Construa conexões profissionais estratégicas.',
    emoji: '🤝', duracao_dias: 30, categoria: 'Carreira',
    tasks: [
      { titulo: 'Conectar com 1 pessoa no LinkedIn', descricao: 'Enviar convite com mensagem', dificuldade: 'easy', horario: '09:00', frequencia: 'daily', dias_semana: [1,2,3,4,5] },
      { titulo: 'Comentar em 3 posts', descricao: 'Engajar com conteúdo relevante', dificuldade: 'easy', horario: '12:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Mandar mensagem a 1 contato antigo', descricao: 'Reativar conexão', dificuldade: 'medium', horario: '14:00', frequencia: 'daily', dias_semana: [2,4] },
      { titulo: 'Publicar conteúdo', descricao: 'Post ou artigo no LinkedIn', dificuldade: 'medium', horario: '10:00', frequencia: 'weekly', dias_semana: [2] },
      { titulo: 'Participar de evento online', descricao: 'Webinar, live ou meetup', dificuldade: 'medium', horario: '19:00', frequencia: 'weekly', dias_semana: [4] },
      { titulo: 'Marcar café com alguém da área', descricao: 'Encontro presencial ou virtual', dificuldade: 'hard', horario: '15:00', frequencia: 'weekly', dias_semana: [5] },
      { titulo: 'Mentorar alguém', descricao: 'Ajudar alguém mais junior', dificuldade: 'hard', horario: '18:00', frequencia: 'weekly', dias_semana: [3] },
    ],
  },
  {
    id: 'cold-shower', titulo: 'Banho Frio & Disciplina', descricao: 'Desenvolva resiliência mental com exposição ao desconforto.',
    emoji: '🧊', duracao_dias: 30, categoria: 'Disciplina',
    tasks: [
      { titulo: '30s de água fria no final', descricao: 'Terminar banho com água gelada', dificuldade: 'easy', horario: '07:00', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: 'Exercício de respiração Wim Hof', descricao: '3 rodadas de hiperventilação', dificuldade: 'easy', horario: '06:45', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: '1min de banho frio', descricao: 'Aumentar tempo gradualmente', dificuldade: 'medium', horario: '07:00', frequencia: 'daily', dias_semana: [1,3,5] },
      { titulo: 'Registrar sensações', descricao: 'Anotar como se sentiu após', dificuldade: 'easy', horario: '07:15', frequencia: 'daily', dias_semana: [0,1,2,3,4,5,6] },
      { titulo: '3min de banho frio', descricao: 'Nível intermediário', dificuldade: 'medium', horario: '07:00', frequencia: 'daily', dias_semana: [2,4,6] },
      { titulo: '5min de banho frio', descricao: 'Resistência mental avançada', dificuldade: 'hard', horario: '07:00', frequencia: 'daily', dias_semana: [6] },
      { titulo: 'Imersão em água gelada', descricao: 'Balde ou banheira com gelo', dificuldade: 'hard', horario: '08:00', frequencia: 'weekly', dias_semana: [0] },
    ],
  },
];

export const DEFAULT_NEW_USER_TASKS = [
  { titulo: 'Levantar da cama', descricao: 'Saia da cama sem apertar soneca', dificuldade: 'easy' as TaskDifficulty, horario: '06:30', frequencia: 'daily' as const, dias_semana: [0,1,2,3,4,5,6] },
  { titulo: 'Tomar água', descricao: 'Beba um copo de água ao acordar', dificuldade: 'easy' as TaskDifficulty, horario: '06:35', frequencia: 'daily' as const, dias_semana: [0,1,2,3,4,5,6] },
  { titulo: 'Tomar banho', descricao: 'Banho para começar o dia bem', dificuldade: 'easy' as TaskDifficulty, horario: '07:00', frequencia: 'daily' as const, dias_semana: [0,1,2,3,4,5,6] },
  { titulo: 'Tomar café da manhã', descricao: 'Não pule a refeição mais importante', dificuldade: 'easy' as TaskDifficulty, horario: '07:30', frequencia: 'daily' as const, dias_semana: [0,1,2,3,4,5,6] },
  { titulo: 'Respirar fundo 5 vezes', descricao: 'Pare, feche os olhos e respire', dificuldade: 'easy' as TaskDifficulty, horario: '08:00', frequencia: 'daily' as const, dias_semana: [0,1,2,3,4,5,6] },
];
