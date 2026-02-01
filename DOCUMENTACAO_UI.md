# DOCUMENTAÇÃO UI - ZAILONSOFT

## SUMÁRIO
1. [Visão Geral do Produto](#visão-geral-do-produto)
2. [Mapa de Páginas](#mapa-de-páginas)
3. [Componentes](#componentes)
4. [Comportamentos e Interações](#comportamentos-e-interações)
5. [Formulários](#formulários)
6. [Fluxos de Telas](#fluxos-de-telas)

---

# VISÃO GERAL DO PRODUTO

## Propósito do Sistema

**ZailonSoft** é um sistema SaaS de CRM automotivo especializado em:

- **Pré-vendas automático**: Sistema de qualificação de leads 24/7 via WhatsApp para lojas de veículos
- **Gerenciamento de clientes**: CRM Kanban com funil de vendas integrado
- **Catálogo de veículos**: Plataforma para listar e gerenciar inventário com imagens e preços
- **Dashboard de vendas**: Relatórios em tempo real, métricas e análise de funil
- **Múltiplas lojas**: Isolamento de dados por loja (multi-tenant)

## Fluxo Principal do Usuário

```
VISITANTE (Público)
    ↓
[HomePage] → [LeadFlow] → [PublicVehicleCatalogPage] ou [PublicCarFormPage]
    ↓
CADASTRO E PAGAMENTO
    ↓
[SignUpPage] → [Stripe Payment] → Email confirmado automaticamente
    ↓
CLIENTE AUTENTICADO
    ↓
[ProtectedRoute] → [Index/MainLayout] → [Dashboard, CRM, Catálogo, etc]
    ↓
GERENCIADOR DE VENDAS
    ↓
Monitora leads, qualifica, envia propostas, fecha vendas
```

## Jornada Completa do Cliente

### 1. **Descoberta (Público)**
- Visitante acessa HomePage (/)
- Vê proposta de valor do Zailon Auto
- Clica em "Conhecer Zailon Auto" → vai para LeadFlow (/ZailonAuto)
- LeadFlow exibe vídeos, features, FAQ
- Ao final, pode visitar um catálogo público de uma loja (/catalogo-loja/:lojaId)

### 2. **Interação com Catálogo Público**
- Visitante vê veículos listados
- Clica em veículo de interesse
- Abre modal com detalhes (imagens, preço, descrição)
- Clica em "Enviar Proposta"
- Vai para PublicCarFormPage (/form-proposta/:carId)

### 3. **Formulário de Proposição**
- Preenche dados pessoais (nome, CPF, telefone, estado)
- Seleciona tipo de negociação (comum, troca, visita)
- Segundo tipo: escolhe veículos de troca + fotos
- Terceiro tipo: escolhe opção de pagamento (financiamento, à vista)
- Financiamento: preenche entrada e parcelas
- Visita: escolhe dia e hora
- Envia e vê mensagem de sucesso
- Os dados são salvos na tabela `clients` do Supabase
- Acionista/Vendedor recebe notificação no CRM

### 4. **Cadastro e Pagamento**
- Visitante clica em "Cadastro" ou CTA na HomePage
- Vai para SignUpPage (/signup)
- Preenche: Nome, Nome da Loja, WhatsApp, Email, Senha
- Clica em "Criar Conta"
- É chamada a função Supabase `start-subscription`
- Redirecionado para Stripe Checkout
- Realiza pagamento
- Retorna para /sistema após sucesso
- Stripe webhook atualiza status para 'active'

### 5. **Acesso ao Dashboard (Autenticado)**
- ProtectedRoute verifica autenticação + status da assinatura
- Se 'active' → libera acesso
- Se 'unpaid' → redireciona para /assinar (tela de regularização)
- Se null/canceled/incomplete → redireciona para /ativar-conta
- Acessa MainLayout com Sidebar
- Pode navegar entre: Dashboard, Catálogo, CRM, Novo Veículo, Configurações

### 6. **Operações Diárias**
- **Dashboard**: Vê métricas, funil de vendas, leads por status
- **CRM**: Arrasta leads entre colunas (Novo Lead → Vendido), edita detalhes, gera PDFs
- **Catálogo**: Edita veículos, remove, adiciona imagens
- **Novo Veículo**: Formulário multietapas para cadastrar novo veículo
- **Configurações**: Edita dados da loja, logo, adiciona vendedores

---

# MAPA DE PÁGINAS

## Páginas Públicas (sem autenticação)

### 1. HomePage (/)

**Objetivo**: Apresentar o produto, destacar valor, converter para signups e demonstrações

**Rota**: `/`

**Layout**: 
- Full-width, hero section com gradient
- Seções empilhadas verticalmente
- Grid responsivo

**Hierarquia Visual**:
```
[Header com CTA]
    ↓
[Hero com 2 colunas: Texto + Cards de Features]
    ↓
[Seção "Quem somos": Grid de 6 cards]
    ↓
[Seção "Software sob medida": 3 cards de serviços]
    ↓
[Footer com CTA]
```

**Breakpoints**:
- **Mobile (<768px)**: Single column, texto maior, imagens responsivas
- **Desktop (≥768px)**: Grid 2 colunas, animações, hover effects

**Fluxo de Navegação**:
- CTA "Conhecer Zailon Auto" → `/ZailonAuto`
- CTA "Software sob medida" → WhatsApp link
- Links internos para Login/Signup via menu

**Componentes Utilizados**:
- `motion.div` (framer-motion) para animações fade-in
- Ícones de lucide-react (Bot, Car, Code2, Sparkles, etc)
- Cards com hover animations
- Links do React Router

**Estados Visuais**:
- **Hover**: Cards aumentam escala (1.05), sombra aumenta, elemento se move para cima (-8px)
- **Ícones**: Giram e aumentam em hover (rotate 8°, scale 1.15)

**Animações**:
- Fade-in-up: elementos aparecem de baixo para cima
- Stagger: cada elemento tem delay
- Hover spring: transições suaves com easing easeOut

---

### 2. LoginPage (/login)

**Objetivo**: Autenticar usuário com email e senha

**Rota**: `/login`

**Layout**:
- Grid 2 colunas em desktop (coluna esquerda: form, coluna direita: imagem/gradiente)
- Single column em mobile
- Fundo escuro premium com gradientes

**Hierarquia Visual**:
```
[Grid 2 col]
    ├─ Coluna Esquerda (mobile/todo):
    │   ├─ Logo + Marca
    │   ├─ Texto de boas-vindas
    │   ├─ Form
    │   │   ├─ Email input
    │   │   ├─ Senha input + "Esqueceu?"
    │   │   ├─ Erro message (condicional)
    │   │   ├─ Botão de login
    │   │   └─ Link para signup
    │   └─ Divider + Social login (futuro)
    └─ Coluna Direita (desktop only):
        └─ Gradiente + imagem/ilustração
```

**Breakpoints**:
- **Mobile (<1024px)**: Single column, form centralizado, padding reduzido
- **Desktop (≥1024px)**: 2 colunas, sidebar visual à direita

**Fluxo de Navegação**:
- Após login sucesso → `/sistema` (ProtectedRoute redireciona)
- Clique em "Esqueceu a senha?" → WhatsApp (554691163405)
- Clique em "Ainda não tem conta?" → `/signup`
- Logout em qualquer página → redirect automático para `/login`

**Componentes Utilizados**:
- `Input` (shadcn/ui)
- `Label` (shadcn/ui)
- Ícones react-feather (Eye, EyeOff para toggle password)
- `motion.div` para animações

**Estados**:
- **Normal**: Form limpo, inputs vazios
- **Loading**: Botão desabilitado, spinner animado
- **Erro**: Mensagem de erro vermelha com border, fade-in
- **Sucesso**: Redireciona silenciosamente

**Validações Visuais**:
- Input ativo: border muda de cor para âmbar/emerald, ring glow
- Input com erro: não há validação visual, apenas mensagem de erro geral

**Mensagens de Erro**:
- "E-mail ou senha inválidos." (credenciais incorretas)
- "Ocorreu um erro ao tentar fazer login." (erro genérico)
- "Ocorreu um erro inesperado durante o login." (catch block)

---

### 3. SignUpPage (/signup)

**Objetivo**: Criar nova conta de usuário e loja, iniciar pagamento

**Rota**: `/signup`

**Layout**:
- Grid 2 colunas (coluna esquerda: form, coluna direita: imagem/conteúdo)
- Fundo escuro com gradientes premium

**Hierarquia Visual**:
```
[Container max-w-6xl grid lg:grid-cols-2]
    ├─ Coluna Esquerda (Form):
    │   ├─ Logo + "Já tem conta?" link
    │   ├─ Texto de apresentação
    │   ├─ Form 2x2 grid (mobile 1 col):
    │   │   ├─ Nome completo
    │   │   ├─ Nome da loja
    │   │   ├─ WhatsApp
    │   │   ├─ Email
    │   │   ├─ Senha (min 6 chars)
    │   │   ├─ Validação de erro
    │   │   └─ Botão "Criar Conta e Pagar"
    │   └─ Footer com link de login
    └─ Coluna Direita (desktop only):
        └─ Imagem/Hero visual
```

**Breakpoints**:
- **Mobile (<1024px)**: Single column com max-w-md, padding reduzido
- **Desktop (≥1024px)**: 2 colunas lado a lado

**Fluxo de Navegação**:
- Preenchimento de form → clique em "Criar Conta e Pagar"
- Chamada para `supabase.functions.invoke('start-subscription')`
- Se sucesso → `window.location.href = data.checkoutUrl` (Stripe)
- Se erro → mostra mensagem de erro vermelha

**Componentes Utilizados**:
- `Input` (shadcn/ui) com className customizado
- `Label` (shadcn/ui)
- `Button` (shadcn/ui) com gradient background
- `motion.div` para fade-in

**Estados**:
- **Normal**: Form limpo
- **Validação**: Se senha < 6 → erro "A senha deve ter no mínimo 6 caracteres."
- **Loading**: Botão mostra spinner, texto muda para "Criando conta..."
- **Erro**: Mensagem de erro BRL-style com background + border
- **Sucesso**: Redireciona para Stripe (sem transição visual)

**Validações de Campo**:
- Nome: obrigatório (required)
- Loja: obrigatório (required)
- WhatsApp: obrigatório (required)
- Email: obrigatório, type="email" (required)
- Senha: obrigatório, mínimo 6 caracteres (validação JS)

**Máscaras/Formatações**:
- WhatsApp: apenas números (HTML5 input type, sem mask library)

---

### 4. LeadFlow (/ZailonAuto)

**Objetivo**: Apresentar o produto Zailon Auto, features, demonstração, FAQ

**Rota**: `/ZailonAuto`

**Layout**:
- Full-width, seções empilhadas
- Hero, Features, Vídeos, Métricas, FAQ, CTA Final

**Hierarquia Visual**:
```
[Section Hero]
    ├─ Gradient background
    ├─ H1 "Zailon Auto: Pré-vendas que trabalham 24/7"
    ├─ Descrição
    └─ 2 CTAs (Conhecer mais / Agendar demo)

[Section Features]
    ├─ H2 + Description
    └─ Grid 3 colunas de cards com ícones

[Section Vídeos]
    ├─ Video componente embarcado
    │   ├─ Poster
    │   ├─ Play button
    │   └─ Auto-play ao scroll (IntersectionObserver)
    └─ Múltiplos vídeos em carousel/grid

[Section Métricas]
    ├─ 3-4 cards com números grandes
    └─ Descrição sob cada métrica

[Section FAQ]
    ├─ Lista de items acordeão
    ├─ Cada item:
    │   ├─ Botão com pergunta + ícone chevron
    │   └─ Conteúdo expansível (AnimatePresence)
    └─ Abrir/fechar suave

[Section CTA Final]
    └─ Grande botão com link para WhatsApp
```

**Breakpoints**:
- **Mobile**: Single column, texto maior, vídeos 100% width
- **Desktop**: Multi-column grids, layouts complexos

**Fluxo de Navegação**:
- CTAs internas: links para `/login`, `/signup`
- WhatsApp: `href="https://wa.me/554691163405?text=..."`
- Scroll revela seções com fade-in

**Componentes Utilizados**:
- `motion.*` (framer-motion) para scroll animations
- `useInView` hook customizado para fade-in ao viewport
- Video tags com `ref` e IntersectionObserver
- FAQ com `useState` para controle de acordeão
- Ícones lucide-react

**Estados Visuais**:
- **Hover cards**: Scale 1.05, shadow aumenta, y -8px
- **Hover buttons**: Brightness/opacity aumenta
- **Video playing**: Sombra ao redor aumenta

**Animações**:
- Fade-in-up nas seções ao scroll
- Stagger nos cards (cada um delay diferente)
- Acordeão com `AnimatePresence` para suave enter/exit
- Vídeos auto-play ao atingir 50% de visibilidade no viewport

---

### 5. PublicVehicleCatalogPage (/catalogo-loja/:lojaId)

**Objetivo**: Exibir catálogo público de veículos de uma loja específica

**Rota**: `/catalogo-loja/:lojaId`

**Layout**:
- Full-width com max-w-7xl container
- Hero header + Grid de cards de veículos

**Hierarquia Visual**:
```
[Header]
    ├─ Logo/Nome da loja
    ├─ Descrição
    └─ Search + Filter inputs

[Grid de Cards]
    ├─ Cada card:
    │   ├─ Imagem (aspect-ratio 4:3)
    │   ├─ Nome do veículo
    │   ├─ Ano
    │   ├─ Preço (emerald-400)
    │   ├─ Badge de status
    │   └─ "Ver Detalhes" button
    └─ Responsive: 1 col mobile, 2 tablet, 3-4 desktop

[Modal de Detalhes] (ao clicar em card)
    ├─ Galeria com thumbnails
    ├─ Info: Preço, Ano, Descrição
    ├─ "Enviar Proposta" button
    └─ "Fechar" button
```

**Breakpoints**:
- **Mobile**: 1 coluna, search full-width
- **Tablet**: 2 colunas
- **Desktop**: 3-4 colunas

**Fluxo de Navegação**:
- Carregamento inicial: busca `cars` por `loja_id` (React Query)
- Clique em card → abre modal com `PublicCarDetailsView`
- Modal "Ver Detalhes" → permanece no modal
- "Enviar Proposta" → `/form-proposta/:carId`
- Busca/filtro: update local state, filtra em tempo real

**Componentes Utilizados**:
- `useQuery` (React Query) para buscar veículos
- `Dialog` + `DialogContent` (shadcn/ui)
- `Input` (busca e filtro)
- Cards customizados

**Estados**:
- **Loading**: Skeleton loaders nos cards
- **Erro**: Mensagem centrada "Erro ao carregar catálogo"
- **Vazio**: "Nenhum veículo encontrado"
- **Sucesso**: Grid de cards renderizado

**Buscas/Filtros**:
- Por nome (pesquisa em tempo real)
- Por preço range (min-max, opcional)
- Por ano (range ou dropdown)

---

### 6. PublicCarFormPage (/form-proposta/:carId)

**Objetivo**: Coletar informações do cliente interessado em um veículo específico

**Rota**: `/form-proposta/:carId`

**Layout**:
- Multi-step form com progress bar
- Left: Veículo detalhes (sticky em desktop)
- Right: Form atual

**Hierarquia Visual**:
```
[Container]
    ├─ Progress bar (0-100% baseado em step)
    ├─ Step indicator "Passo X de Y"
    ├─ Grid 2 col (mobile 1):
    │   ├─ Col Esquerda (sticky desktop):
    │   │   └─ CarDetailsDisplay
    │   │       ├─ Imagem principal + gallery nav
    │   │       ├─ Nome, Ano, Preço
    │   │       ├─ Descrição expandível
    │   │       └─ Mobile: colapsável
    │   └─ Col Direita:
    │       ├─ Step 0: Tipo de negociação (comum/troca/visita)
    │       ├─ Step 1: Dados pessoais (nome, CPF, telefone, estado, job)
    │       ├─ Step 2a: Seleção de veículos [se troca]
    │       ├─ Step 2b: Fotos de troca [se troca]
    │       ├─ Step 3a: Financiamento [se comum]
    │       ├─ Step 3b: Visita agendada [se visita]
    │       ├─ Step 4: Review + Confirmação
    │       └─ Navegação: Voltar/Próximo/Enviar buttons
    └─ Toast notifications (sucesso/erro)
```

**Breakpoints**:
- **Mobile**: Single column, form full-width, veículo no topo colapsável
- **Tablet**: 2 colunas desiguais (1:1.5)
- **Desktop**: 2 colunas (1:1.8), esquerda sticky

**Fluxo de Navegação**:
- URL params: `:carId` → busca dados do veículo via API
- Step by step: forward/backward com validações
- Sucesso: POST para Supabase `clients` table
- Mensagem de sucesso + redirect para home ou novo form

**Componentes Utilizados**:
- `useParams` para `:carId`
- `useQuery` para fetch veículo
- `useReducer` para state management de form complexo
- `useToast` para notificações
- Sub-componentes: `StepDealType`, `StepPersonalData`, `StepFileUpload`, etc

**Estados de Cada Step**:

#### Step 0: Tipo de Negociação
```
Botões de escolha:
├─ [ ] Compra comum (colorido)
├─ [ ] Troca de veículo (colorido)
└─ [ ] Visita agendada (colorido)

Seleção: renderiza UI diferente para os próximos passos
```

#### Step 1: Dados Pessoais
```
Campos obrigatórios:
├─ Nome completo
├─ CPF (mask: XXX.XXX.XXX-XX)
├─ Telefone (mask: (XX) XXXXX-XXXX)
├─ Profissão/Trabalho (input)
└─ Estado/Localização (dropdown com estados BR)

Validações:
├─ Nome: não vazio, mínimo 3 caracteres
├─ CPF: máscara + validação de dígitos
├─ Telefone: máscara + não vazio
├─ Profissão: não vazio
└─ Estado: selecionado

Visual:
├─ Inputs com focus ring emerald-500
├─ Label cinza acima
├─ Erro inline em vermelho [se validação falha ao clicar next]
└─ Tooltip helper (ícone info)
```

#### Step 2a: Seleção de Veículos (se troca)
```
Componente: Multiselectbutton ou Checkbox list
├─ Busca catálogo da loja
├─ Cada item:
│   ├─ Checkbox
│   ├─ Miniatura imagem
│   ├─ Nome + Ano + Preço
│   └─ Badge de seleção
├─ Mínimo 1 seleção obrigatória
└─ Max 3 (limite negociável)

Validação:
└─ Erro se 0 selecionados ao clicar "Próximo"
```

#### Step 2b: Fotos de Troca (se troca)
```
Upload de múltiplas imagens:
├─ Drag & drop ou file picker
├─ Preview de cada imagem antes upload
├─ Progressbar de compressão/upload
├─ Remove individual
├─ Validações:
│   ├─ Máximo 5 fotos
│   ├─ Máximo 5MB por foto (compressão automática com browser-image-compression)
│   ├─ Apenas JPG/PNG/WEBP
│   └─ Mínimo 1 foto obrigatória
└─ Feedback visual durante upload
```

#### Step 3a: Financiamento (se comum)
```
Radiobuttons:
├─ À vista (sem campos extras)
├─ Financiado:
│   ├─ Entrada (BRL, mask de moeda)
│   └─ Parcelas (número, default 12)
└─ Troca + Financiado (combo)

Validações:
├─ Entrada > 0
├─ Entrada ≤ preço do veículo
├─ Parcelas entre 1-84
└─ Parcelas × (valor restante / parcelas) = preço final validado

Visual:
├─ Cálculo automático de valor à financiar
├─ Preview: "Total a financiar: R$ X.XXX,00"
└─ Aviso se entrada < 30% do preço (negociável)
```

#### Step 3b: Visita Agendada (se visita)
```
Agendamento:
├─ Date picker (future dates only)
├─ Time picker (horário comercial, ex: 08:00-18:00)
├─ Dropdown de vendedor (busca `vendedores` da loja)
└─ Observações (textarea opcional)

Validações:
├─ Data > hoje
├─ Hora dentro do horário comercial
├─ Vendedor selecionado (obrigatório se existir)
└─ Sem conflitos (back-end valida, front-end aviso)

Visual:
├─ Calendar input com styled datepicker
├─ Time input HH:MM
├─ Confirmação: "Agendado para dia X, hora Y com Z"
└─ Link para adicionar ao Google Calendar (futuro)
```

#### Step 4: Review & Confirmação
```
Layout:
├─ Card com resumo de cada seção:
│   ├─ Tipo de negociação
│   ├─ Dados pessoais
│   ├─ Veículos (se troca)
│   ├─ Fotos (thumbnail grid, se troca)
│   ├─ Financiamento (se aplicável)
│   ├─ Visita (se aplicável)
│   └─ Cada seção com ícone + "Editar" link
├─ Botões:
│   ├─ "← Voltar" (previous step)
│   ├─ "Enviar Proposta →" (POST + loading)
│   └─ Cancel (home)
└─ Confirmação:
    ├─ Sucesso: Toast verde + "Proposta enviada com sucesso!"
    ├─ Email enviado para loja
    ├─ Redirect: `/` ou `/catalogo-loja/:lojaId`
    └─ Erro: Toast vermelho + detalhe do erro
```

**Animações**:
- Fade-in-up ao entrar em cada step
- Fade-out ao sair
- Progress bar smooth fill
- Button hover/click feedback

---

### 7. SubscribePage (/assinar)

**Objetivo**: Tela para regularizar pagamentos recusados (status 'unpaid')

**Rota**: `/assinar`

**Condição**: `subscription.status === 'unpaid'`

**Layout**:
- Janela estilo "Terminal" de checkout
- 2 colunas: esquerda (main), direita (widget)

**Hierarquia Visual**:
```
[Container]
    ├─ Browser-like header (red/amber/green dots)
    ├─ Grid 2 col (md: border-right, desktop: full)
    │   ├─ Col Esquerda (1.4fr):
    │   │   ├─ Badge "Pagamento recusado • Acesso suspenso"
    │   │   ├─ H1 "Não conseguimos renovar sua assinatura"
    │   │   ├─ Descrição
    │   │   ├─ Erro message (se houver)
    │   │   ├─ Button "Regularizar pagamento agora" (loads portal)
    │   │   ├─ "Sair da conta" link
    │   │   └─ Info text (pequeno)
    │   └─ Col Direita (1fr, bg-slate-950/90):
    │       ├─ Card "Status da assinatura"
    │       ├─ Card "Detalhes da cobrança"
    │       └─ Info: "Alterações no portal seguro"
    └─ Max-w-2xl container, border rounded-3xl
```

**Breakpoints**:
- **Mobile**: Single column, border-bottom entre seções
- **Tablet**: 2 colunas desiguais
- **Desktop**: 2 colunas com sidebar visual

**Fluxo de Navegação**:
- URL: `/assinar` (protegido, apenas para usuários com subscription ativa)
- Clique em "Regularizar pagamento agora" → `supabase.functions.invoke('create-customer-portal-link')`
- Retorna `portalUrl` → `window.location.href = portalUrl` (Stripe Customer Portal)
- Ao fechar portal: volta para `/sistema` (usuario já atualizado via webhook)
- "Sair da conta" → logout + redirect `/login`

**Estados**:
- **Loading**: Botão mostra spinner, texto "Abrindo portal..."
- **Erro**: Mensagem vermelha com detalhe
- **Sucesso**: Redireciona para Stripe

---

### 8. ActivateAccountPage (/ativar-conta)

**Objetivo**: Tela para ativar conta cancelada ou criar primeira assinatura

**Rota**: `/ativar-conta`

**Condição**: `subscription.status !== 'active'` (exceto 'unpaid', que vai para /assinar)

**Layout**:
- Card centralizado, simples e claro
- Fundo escuro com gradientes

**Hierarquia Visual**:
```
[Container full-screen flex]
    └─ Card (max-w-md):
        ├─ Ícone CreditCard (âmbar)
        ├─ H1 "Ative sua Conta"
        ├─ Descrição
        ├─ Erro message (se houver, vermelho)
        ├─ Button "Pagar Mensalidade e Ativar" (gradient)
        └─ "Sair da conta" link
```

**Breakpoints**:
- **Mobile**: Full-width com padding
- **Desktop**: Card centralizado max-w-md

**Fluxo de Navegação**:
- URL: `/ativar-conta` (protegido)
- Clique em "Pagar Mensalidade e Ativar" → `supabase.functions.invoke('create-checkout-link')`
- Retorna `checkoutUrl` → `window.location.href = checkoutUrl` (Stripe Checkout)
- Sucesso: Stripe redireciona para `/sistema`
- Webhook atualiza subscription status para 'active'

---

### 9. NotFound (/*)

**Objetivo**: Mostrar erro 404 para rotas inválidas

**Rota**: `/*`

**Layout**:
- Centered flex container
- Ícone + Texto + Button

**Hierarquia Visual**:
```
[Full-screen flex]
    └─ Container:
        ├─ Ícone AlertTriangle (vermelho)
        ├─ H1 "404"
        ├─ "Página não encontrada"
        ├─ Mensagem descritiva (rota tentada)
        ├─ Button "Voltar para o Início" (Home icon)
        └─ Link para "/"
```

---

## Páginas Protegidas (com autenticação)

### 10. Index / MainLayout (/sistema/*)

**Objetivo**: Layout principal para todas as páginas autenticadas

**Rota**: `/sistema/*`

**ProtectedRoute**: Valida autenticação + subscription status

**Layout**:
- Sidebar fixa à esquerda (desktop) / drawer mobile
- Main content area responsiva
- Background animado com dots

**Hierarquia Visual**:
```
[MainLayout]
    ├─ Sidebar (fixed, 64px no mobile, 256px desktop):
    │   ├─ Marca (logo + nome)
    │   ├─ Menu items:
    │   │   ├─ Dashboard
    │   │   ├─ Catálogo
    │   │   ├─ CRM
    │   │   ├─ Novo Veículo
    │   │   └─ Configurações
    │   ├─ Separator
    │   └─ Logout button
    ├─ Main (md:ml-64 p-4 md:p-8):
    │   ├─ Animated background
    │   ├─ Light dots floating
    │   ├─ Grid + Halo light
    │   └─ Content (Outlet do React Router)
    └─ Mobile nav (sheet drawer)
```

**Breakpoints**:
- **Mobile**: Sidebar drawer (hamburger), main full-width
- **Desktop**: Sidebar fixed left, main ml-64

**Fluxo de Navegação**:
- Cada menu item: `navigate('/sistema/:path')`
- Componentes lazy-loaded com `lazySafe` util
- Suspense fallback: "Carregando..."

**Componentes**:
- `Sidebar` (component dedicado)
- `AnimatedBackground` (grid + halo)
- `LightDotsBackground` (floating dots animation)
- `Outlet` (React Router)

---

### 11. Dashboard (/sistema/dashboard)

**Objetivo**: Visão geral do negócio com métricas, funil, relatórios

**Rota**: `/sistema/dashboard`

**Layout**:
- Grid responsivo com cards e gráficos
- Funil em colunas
- Métricas em cards
- Gráficos de linha/barra

**Hierarquia Visual**:
```
[Container]
    ├─ Header com título + filtros
    ├─ Grid auto-fit de cards (KPIs):
    │   ├─ Total de leads
    │   ├─ Conversão %
    │   ├─ Valor em pipeline
    │   ├─ Ciclo médio (dias)
    │   └─ Ticket médio
    ├─ Funil de Vendas (7 colunas):
    │   ├─ Novo Lead
    │   ├─ Em Contato
    │   ├─ Qualificado
    │   ├─ Proposta Enviada
    │   ├─ Negociação Final
    │   ├─ Vendido
    │   └─ Perdido
    │   
    │   Cada coluna:
    │   ├─ Header: Status + Contador
    │   ├─ Cards dos leads (draggable):
    │   │   ├─ Nome + Telefone
    │   │   ├─ Veículo interessado
    │   │   ├─ Data
    │   │   ├─ Valor estimado
    │   │   └─ Click → abre modal com detalhes
    │   └─ Background gradient por status
    │
    ├─ Gráficos (Charts.js):
    │   ├─ Linha: Leads por dia (últimos 30 dias)
    │   ├─ Barra: Conversão por etapa
    │   └─ Pizza: Distribuição de tipos de negócio
    │
    └─ Tabela de Leads Recentes:
        ├─ Colunas: Nome, Telefone, Veículo, Status, Valor, Data
        ├─ Paginação
        ├─ Sort por coluna
        └─ Ações: Ver detalhes, Editar, Deletar
```

**Breakpoints**:
- **Mobile**: Single column, cards empilhados, funil em scroll horizontal
- **Desktop**: Grid multi-column

**Dados**:
- Fetch `clients` com React Query (`useQuery`)
- Normalizações: `normalizaEstadoParaFunil`, parsers de moeda/data
- Agrupamento por status do funil
- Cálculos: soma de valores, contagem por etapa, médias

**Estados**:
- **Loading**: Skeleton loaders
- **Erro**: Mensagem centrada
- **Vazio**: "Nenhum lead cadastrado ainda"
- **Sucesso**: Dados renderizados

**Interações**:
- Clique em card → abre modal com detalhes do lead
- Hover em card → sombra aumenta, y se move
- Arrastar card entre colunas → atualiza status (futuramente integrado com CRM)
- Clique em métrica → drill-down (futuro)

---

### 12. CRMKanban (/sistema/crm)

**Objetivo**: Gerenciar leads com arrastar-soltar, edição inline, geração de PDF

**Rota**: `/sistema/crm`

**Layout**:
- Kanban horizontal com 7 colunas
- Cada coluna = etapa do funil
- Cards dos leads arraváveis

**Hierarquia Visual**:
```
[Container]
    ├─ Header:
    │   ├─ Título + Ícone
    │   ├─ Filtros: Busca, Ordenação, Prioridade
    │   └─ Botões: Refresh, Export
    │
    ├─ Kanban Board (horizontal scroll em mobile):
    │   ├─ 7 Colunas (DnD context):
    │   │   ├─ Header da coluna:
    │   │   │   ├─ Cor do status
    │   │   │   ├─ Nome da etapa
    │   │   │   ├─ Contador de cards
    │   │   │   └─ Menu (dropdown, adicionar card, limpar, etc)
    │   │   │
    │   │   └─ Lista de cards (sortable):
    │   │       ├─ Cada card é draggable:
    │   │       │   ├─ Header:
    │   │       │   │   ├─ Prioridade (badge cor)
    │   │       │   │   ├─ Nome do lead
    │   │       │   │   └─ Close button (delete)
    │   │       │   ├─ Body:
    │   │       │   │   ├─ Telefone + icon WhatsApp
    │   │       │   │   ├─ Veículo
    │   │       │   │   ├─ Valor
    │   │       │   │   ├─ Data de entrada
    │   │       │   │   └─ Dias na etapa (com aviso se > X dias)
    │   │       │   └─ Footer:
    │   │       │       ├─ Botão "Editar"
    │   │       │       ├─ Botão "PDF"
    │   │       │       └─ Botão "Arquivar"
    │   │       │
    │   │       └─ Card vazio: "Nenhum lead"
    │   │
    │   └─ Drag overlay: preview do card sendo arrastado
    │
    └─ Modal de Edição de Lead:
        ├─ Tabs: Detalhes, Histórico, Ações
        ├─ Campos editáveis:
        │   ├─ Nome
        │   ├─ Telefone
        │   ├─ CPF
        │   ├─ Email
        │   ├─ Profissão
        │   ├─ Veículos interessados
        │   ├─ Valor estimado
        │   ├─ Notas (textarea)
        │   ├─ Prioridade (dropdown)
        │   └─ Data de follow-up
        ├─ Ações:
        │   ├─ "Salvar"
        │   ├─ "Cancelar"
        │   ├─ "Gerar PDF"
        │   ├─ "Enviar WhatsApp"
        │   └─ "Deletar"
        └─ Histórico (feed de mudanças)
```

**Breakpoints**:
- **Mobile**: Kanban em scroll horizontal, modal full-screen
- **Desktop**: Kanban com overflow scroll, modal em dialog

**Drag & Drop**:
- Lib: `@dnd-kit/core` + `@dnd-kit/sortable`
- Drag entre colunas → atualiza status (mutation `updateClientStatus`)
- Drag dentro da coluna → reordena (opcional)
- `DragOverlay` mostra preview ao arrastar

**Estados**:
- **Loading**: Skeleton loaders nas colunas
- **Erro**: Toast com mensagem
- **Vazio**: Cada coluna mostra "Nenhum lead"
- **Sucesso**: Kanban renderizado

**Interações**:
- Arrastar card → POST `updateClientStatus` ao soltar
- Clique em card → abre modal de edição (Dialog)
- Modal "Salvar" → PUT com dados atualizados
- Modal "Gerar PDF" → `html2canvas` + `jsPDF` (download)
- Modal "Enviar WhatsApp" → link `wa.me/phone?text=...`
- Clique em "Deletar" → confirmação → DELETE (soft delete)

**Geração de PDF**:
- Elemento a renderizar: cards do lead com detalhes
- Captura via `html2canvas`
- Converte para PDF via `jsPDF`
- Filename: `proposta_${leadName}_${date}.pdf`
- Download automático

---

### 13. VehicleCatalog (/sistema/catalog)

**Objetivo**: Listar, buscar, editar e deletar veículos da loja

**Rota**: `/sistema/catalog`

**Layout**:
- Header com busca + filtros
- Grid responsivo de cards
- Modal de detalhes/edição

**Hierarquia Visual**:
```
[Container]
    ├─ Header:
    │   ├─ Título
    │   ├─ Search input (name, year, price range)
    │   ├─ Sort dropdown (preço, nome, ano)
    │   └─ Button "Novo Veículo" → /sistema/add-vehicle
    │
    ├─ Grid de Cards (1-2-3-4 cols responsivo):
    │   ├─ Cada card:
    │   │   ├─ Imagem (aspect-ratio 4:3)
    │   │   │   └─ Hover overlay: "Ver detalhes"
    │   │   ├─ Nome
    │   │   ├─ Ano + Preço
    │   │   ├─ Badges (disponível, promo, etc)
    │   │   └─ Ações (3 dots menu):
    │   │       ├─ Editar
    │   │       ├─ Duplicar
    │   │       └─ Deletar
    │   │
    │   └─ Card clicável → abre modal de detalhes
    │
    └─ Modal de Detalhes/Edição:
        ├─ Vista read-only:
        │   ├─ Galeria com thumbnails
        │   ├─ Info: Nome, Ano, Preço, Descrição
        │   ├─ Botão "Editar"
        │   └─ Botão "Voltar"
        │
        └─ Vista edição (toggle com botão):
            ├─ Input nome (autofocus)
            ├─ Textarea descrição
            ├─ Input ano (validação)
            ├─ Input preço (mask de moeda)
            ├─ Upload de novas imagens (drag-drop)
            ├─ Galeria com remove button em cada imagem
            ├─ Buttons: "Cancelar", "Salvar" (loading)
            └─ Toast de sucesso/erro
```

**Breakpoints**:
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 3-4 colunas

**Dados**:
- Fetch `cars` por `loja_id` (React Query)
- Filtros locais: name, year range, price range
- Sort: preço asc/desc, nome asc/desc, ano asc/desc

**Estados**:
- **Loading**: Skeleton grid
- **Erro**: Mensagem centrada
- **Vazio**: "Nenhum veículo cadastrado. Adicione um novo clicando no botão."
- **Sucesso**: Grid renderizado

**Interações**:
- Clique em card → abre modal
- Modal "Editar" → toggle para edit mode
- Upload de imagens: compressão automática, progress bar
- "Salvar" → mutation com React Query, invalidate query, toast
- "Deletar" → confirmação + mutation + grid atualizado

---

### 14. AddVehicle (/sistema/add-vehicle)

**Objetivo**: Formulário multi-step para adicionar novo veículo com imagens

**Rota**: `/sistema/add-vehicle`

**Layout**:
- Stepper com 5 passos
- Form responsivo
- Preview de imagens

**Hierarquia Visual**:
```
[Container max-w-4xl]
    ├─ Stepper (visual + textual):
    │   ├─ Step 1: Info Básicas
    │   ├─ Step 2: Descrição
    │   ├─ Step 3: Imagens
    │   ├─ Step 4: Review
    │   └─ Step 5: Sucesso
    │
    ├─ Form area (motion animated):
    │   │
    │   ├─ [Step 1] Info Básicas:
    │   │   ├─ Label "Informações do Veículo"
    │   │   ├─ Grid 2 col (mobile 1):
    │   │   │   ├─ Input "Nome/Modelo" (required, min 3)
    │   │   │   └─ Input "Ano" (required, 1900-2027)
    │   │   ├─ Input "Preço" (mask de moeda, required, > 0)
    │   │   └─ Helper text: "Todos os campos são obrigatórios."
    │   │
    │   ├─ [Step 2] Descrição:
    │   │   ├─ Textarea "Descrição" (max 1000 chars)
    │   │   ├─ Contador de caracteres
    │   │   └─ Helper: "Descreva features, km, histórico, etc."
    │   │
    │   ├─ [Step 3] Imagens:
    │   │   ├─ Drag & drop zone:
    │   │   │   ├─ Ícone upload
    │   │   │   ├─ Texto "Arraste imagens ou clique"
    │   │   │   └─ Input file hidden (accept jpg/png/webp)
    │   │   ├─ Grid de previews:
    │   │   │   ├─ Cada imagem:
    │   │   │   │   ├─ Preview
    │   │   │   │   ├─ % de compressão
    │   │   │   │   └─ Remove button
    │   │   │   └─ Progress bar (compressão/upload)
    │   │   ├─ Validação:
    │   │   │   ├─ Mínimo 1 imagem (required)
    │   │   │   ├─ Máximo 10 imagens
    │   │   │   ├─ Máximo 5MB por imagem (antes compressão)
    │   │   │   └─ Apenas JPG/PNG/WEBP
    │   │   └─ Compressão automática ao selecionar (browser-image-compression)
    │   │
    │   ├─ [Step 4] Review:
    │   │   ├─ Card "Revisar Informações":
    │   │   │   ├─ Nome + Ano + Preço
    │   │   │   ├─ Descrição (truncada)
    │   │   │   ├─ Contador de imagens
    │   │   │   └─ "Clique em Próximo para confirmar"
    │   │   └─ Botões: "← Voltar", "Publicar Veículo →"
    │   │
    │   └─ [Step 5] Sucesso:
    │       ├─ Ícone check circulado (green)
    │       ├─ "Veículo cadastrado com sucesso! 🎉"
    │       ├─ "Seu veículo foi adicionado ao catálogo."
    │       ├─ Link "Ver no catálogo" → /sistema/catalog
    │       └─ Button "Cadastrar outro veículo" → reset + volta step 1
    │
    └─ Navigation buttons:
        ├─ Volta (prev) → validação, step anterior
        ├─ Próximo (next) → validação, step posterior
        └─ Cancelar → voltar para /sistema/catalog
```

**Breakpoints**:
- **Mobile**: Form full-width, single column inputs
- **Desktop**: Grid layout, sidebar stepper

**Validações**:
- **Step 1**:
  - Nome: obrigatório, min 3 chars, max 100
  - Ano: obrigatório, número, 1900-2027
  - Preço: obrigatório, > 0, format BRL
- **Step 3**:
  - Mínimo 1 imagem
  - Máximo 10 imagens
  - Máximo 5MB por imagem
  - Apenas JPG/PNG/WEBP

**Compressão de Imagens**:
- Lib: `browser-image-compression`
- Triggered ao selecionar arquivo
- Máximo width: 1920px
- Máximo height: 1080px
- Quality: 0.8
- Progress visual durante compressão

**Upload**:
- Ao clicar "Publicar":
  - POST para `addVehicleToSupabase`
  - Envia: metadata (nome, ano, preço, desc) + arquivos
  - Backend: upload para Storage (`car-images/:lojaId/:carId/`)
  - Backend: insert em `cars` table
  - Frontend: invalidate React Query, toast sucesso, show step 5

**Animações**:
- Fade-in-up ao entrar em cada step
- Fade-out ao sair
- Botões com hover scale

---

### 15. StoreSettingsPage (/sistema/settings)

**Objetivo**: Gerenciar dados da loja, logo, vendedores

**Rota**: `/sistema/settings`

**Layout**:
- Tabs ou sections
- Cards para cada seção

**Hierarquia Visual**:
```
[Container]
    ├─ Tabs:
    │   ├─ Loja
    │   ├─ Vendedores
    │   └─ Assinatura (futuro)
    │
    ├─ [Tab Loja]
    │   └─ Card "Informações da Loja":
    │       ├─ Logo upload:
    │       │   ├─ Imagem atual (preview)
    │       │   ├─ Button "Alterar Logo"
    │       │   └─ Input file hidden
    │       ├─ Form:
    │       │   ├─ Input "Nome da Loja"
    │       │   ├─ Input "Email"
    │       │   ├─ Input "WhatsApp"
    │       │   ├─ Textarea "Descrição"
    │       │   ├─ Input "Telefone"
    │       │   ├─ Input "Endereço"
    │       │   └─ Input "Horário de funcionamento"
    │       └─ Buttons: "Cancelar", "Salvar"
    │
    └─ [Tab Vendedores]
        ├─ Card "Lista de Vendedores":
        │   ├─ Tabela:
        │   │   ├─ Colunas: Nome, Email, WhatsApp, Telefone, Ações
        │   │   ├─ Cada row:
        │   │   │   ├─ Dados renderizados
        │   │   │   └─ Button delete (confirmação)
        │   │   └─ Button "Novo Vendedor"
        │   │
        │   └─ Form "Adicionar Vendedor":
        │       ├─ Grid 2 col (mobile 1):
        │       │   ├─ Input "Nome"
        │       │   ├─ Input "Email"
        │       │   ├─ Input "WhatsApp"
        │       │   ├─ Input "Telefone"
        │       │   └─ Buttons: "Adicionar", "Cancelar"
        │       └─ Validações:
        │           ├─ Nome obrigatório
        │           ├─ Email válido
        │           └─ WhatsApp ou Telefone obrigatório
```

**Breakpoints**:
- **Mobile**: Full-width, tabela scrollable
- **Desktop**: Tabs bem definidas

**Dados**:
- Fetch `storeDetails` + `vendedores` (React Query)
- Mutação: `updateStoreDetails`, `createVendedor`, `deleteVendedor`

**Estados**:
- **Loading**: Skeleton loaders
- **Erro**: Toast com mensagem
- **Vazio**: Vendedores: "Nenhum vendedor cadastrado"
- **Sucesso**: Dados renderizados, toast de confirmação

**Interações**:
- Upload de logo: preview + mutation com file upload
- Editar loja: mutation PUT com dados atualizados
- Adicionar vendedor: mutation POST com validações
- Deletar vendedor: confirmação + mutation DELETE

---

### 16. HelpPage (/sistema/help)

**Objetivo**: Central de ajuda com vídeos e busca

**Rota**: `/sistema/help`

**Layout**:
- Hero header
- Busca + Filtros (categorias)
- Grid de cards de vídeos

**Hierarquia Visual**:
```
[Container]
    ├─ Hero:
    │   ├─ Ícone HelpCircle em círculo
    │   ├─ H1 "Central de Ajuda"
    │   └─ Subtitle "Tutoriais e guias completos"
    │
    ├─ Controls:
    │   ├─ Search input (real-time)
    │   ├─ Category chips (todos, categoria1, categoria2, ...)
    │   └─ Sort dropdown (relevância, recente, popular)
    │
    ├─ Vídeos Agrupados por Categoria:
    │   ├─ [Categoria] Section:
    │   │   ├─ Título da categoria
    │   │   ├─ Grid de Video Cards:
    │   │   │   ├─ Cada card:
    │   │   │   │   ├─ Thumbnail/Poster
    │   │   │   │   ├─ Play icon overlay
    │   │   │   │   ├─ Duração do vídeo (badge)
    │   │   │   │   ├─ Título
    │   │   │   │   ├─ Descrição (truncada)
    │   │   │   │   └─ Click → abre VideoModal
    │   │   │   └─ Exemplo: 4 cards por categoria
    │   │   │
    │   │   └─ Link "Ver todos" da categoria (futuro)
    │   │
    │   └─ [Outra Categoria] Section (repete)
    │
    └─ VideoModal (Dialog):
        ├─ Header com close button
        ├─ Video player (autoplay ao abrir):
        │   ├─ Vídeo tag com poster
        │   ├─ Controls: play, pause, fullscreen
        │   └─ Subtítulos (se disponível)
        ├─ Detalhes:
        │   ├─ Título + Categoria
        │   ├─ Descrição full
        │   ├─ Duração
        │   └─ Data de publicação
        ├─ Vídeos Relacionados:
        │   └─ 4 cards da mesma categoria
        └─ Botão "Fechar"
```

**Breakpoints**:
- **Mobile**: Single column de cards, full-width modal
- **Desktop**: 2-4 colunas

**Busca/Filtros**:
- Real-time filtering (local state)
- Busca em: título, descrição, categoria
- Case-insensitive
- Filter por categoria com chips

**Dados**:
- Array de vídeos em `src/components/data/helpVideos.ts`
- Cada vídeo: id, title, description, category, videoUrl, poster, duration

**Estados**:
- **Vazio**: "Nenhum vídeo encontrado para sua busca"
- **Sucesso**: Grid de cards renderizado

**Interações**:
- Clique em card → abre modal com vídeo
- Modal: vídeo auto-play ao abrir
- Busca: filtra em tempo real
- Categoria chip: toggle ativo/inativo
- Vídeos relacionados: clique → abre novo vídeo

---

# COMPONENTES

## Componentes de Formulário

### StepPersonalData
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Renderizar e gerenciar dados pessoais do lead (nome, CPF, telefone, profissão, estado)

**Props**:
```typescript
{
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}
```

**Estados Internos**:
- `formData.name`: string
- `formData.phone`: string (máscara)
- `formData.cpf`: string (máscara)
- `formData.job`: string
- `formData.state`: string (dropdown)

**Eventos**:
- `onChange` em cada input → atualiza formData
- Validação ao blur de cada campo

**Máscaras**:
- CPF: XXX.XXX.XXX-XX
- Telefone: (XX) XXXXX-XXXX

**Validações**:
- Nome: não vazio, min 3 chars
- CPF: válido (validação de dígitos)
- Telefone: não vazio
- Profissão: não vazio
- Estado: obrigatório

---

### StepFileUpload
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Upload de múltiplos arquivos (fotos de troca, documentos)

**Props**:
```typescript
{
  files: Files;
  setFiles: (files: Files) => void;
  uploadType: 'trade_in_photos' | 'documents';
}
```

**Estados Internos**:
- `uploadProgress`: Record<string, number>
- `isCompressing`: boolean
- `selectedFiles`: File[]

**Eventos**:
- Drag & drop: `onDrop`
- Click: file picker
- Remove: remover do array

**Validações**:
- Mínimo 1 arquivo
- Máximo 5 arquivos
- Máximo 5MB por arquivo
- Apenas JPG/PNG/WEBP/PDF

**Compressão**:
- Automática via `browser-image-compression`
- Display de progress bar

---

### StepPaymentType
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Seleção de tipo de negociação (comum, troca, visita)

**Props**:
```typescript
{
  dealType: string;
  setDealType: (type: string) => void;
}
```

**Estados Internos**:
- `dealType`: 'comum' | 'troca' | 'visita'

**Renderização Condicional**:
- 3 botões lado a lado, cada um com cor/ícone diferente
- Botão ativo tem background colorido + border highlighted

---

### StepFinancing
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Detalhes de financiamento (entrada, parcelas)

**Props**:
```typescript
{
  formData: FormData;
  setFormData: (data: FormData) => void;
  vehiclePrice: number;
}
```

**Estados**:
- `paymentType`: 'à_vista' | 'financiado'
- `entry`: string (moeda)
- `parcels`: string (número)

**Cálculos**:
- Valor a financiar = vehiclePrice - entry
- Validação: entry ≤ vehiclePrice

**Validações**:
- Entrada > 0
- Entrada ≤ preço do veículo
- Parcelas entre 1-84

---

### StepTradeDetails
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Seleção de veículos de troca + upload de fotos

**Props**:
```typescript
{
  formData: FormData;
  setFormData: (data: FormData) => void;
  tradeInPhotos: File[];
  setTradeInPhotos: (files: File[]) => void;
}
```

**Estados**:
- `selectedVehicles`: Car[]
- `tradeInPhotos`: File[]

**Validações**:
- Mínimo 1 veículo selecionado
- Mínimo 1 foto

---

### StepVisitDetails
**Arquivo**: `src/components/AddClient.tsx`

**Responsabilidade**: Agendamento de visita

**Props**:
```typescript
{
  formData: FormData;
  setFormData: (data: FormData) => void;
  availableSellers?: Vendedor[];
}
```

**Estados**:
- `visitDate`: string (YYYY-MM-DD)
- `visitTime`: string (HH:MM)
- `selectedSeller`: string (vendedor ID)
- `notes`: string

**Validações**:
- Data > hoje
- Hora dentro horário comercial
- Vendedor selecionado (se houver)

---

## Componentes de UI

### CarDetailsDisplay
**Arquivo**: `src/pages/PublicCarFormPage.tsx` e `PublicVehicleCatalogPage.tsx`

**Responsabilidade**: Exibir detalhes do veículo com galeria

**Props**:
```typescript
{
  vehicle: Car;
  onImageChange?: (index: number) => void;
}
```

**Estados Internos**:
- `currentImageIndex`: number
- `isDescriptionExpanded`: boolean

**Renderização**:
- Imagem principal
- Thumbnails em grid
- Botões nav (prev/next)
- Descrição expandível

---

### Dashboard
**Arquivo**: `src/components/Dashboard.tsx`

**Responsabilidade**: Visão geral de negócios com métricas e funil

**Props**: Nenhuma (usa hooks)

**Estados Internos**:
- Dados de clients (query)
- Dados de cars (query)
- Funil normalizado
- Filtros (data range, loja, etc)

**Interações**:
- Clique em card → abre modal
- Arrastar entre colunas (futuro)
- Filtros de data/status

---

### CRMKanban
**Arquivo**: `src/components/CRMKanban.tsx`

**Responsabilidade**: Kanban com drag-drop, edição, PDF

**Props**: Nenhuma

**Estados Internos**:
- `clients`: Array de clients
- `selectedClient`: Client | null
- `isModalOpen`: boolean
- Dnd-kit context

**Interações**:
- Arrastar card entre colunas
- Clique para editar
- Gerar PDF
- Deletar

---

### VehicleCatalog
**Arquivo**: `src/components/VehicleCatalog.tsx`

**Responsabilidade**: Listar, buscar, editar, deletar veículos

**Props**: Nenhuma

**Estados Internos**:
- `vehicles`: Car[]
- `selectedCar`: Car | null
- `isEditMode`: boolean
- Filtros (search, sort)

---

### AddVehicle
**Arquivo**: `src/components/AddVehicle.tsx`

**Responsabilidade**: Form multi-step para adicionar veículo

**Props**: Nenhuma

**Estados Internos**:
- `step`: number (1-5)
- `formData`: { name, year, price, description }
- `images`: File[]
- `isCompressing`: boolean

**Validações**:
- Cada step tem validação antes de passar para próximo

---

### Sidebar
**Arquivo**: `src/components/Sidebar.tsx`

**Responsabilidade**: Menu de navegação (desktop + mobile)

**Props**:
```typescript
{
  logoSrc?: string;
  companyName?: string;
}
```

**Componentes**:
- `BrandMark`: Logo + nome (customizável)
- `MenuContent`: Lista de itens + logout
- `MainSidebar`: Desktop (fixed left)
- `MobileSidebar`: Mobile (sheet drawer)

**Interações**:
- Clique em item → navigate
- Logout → mutation + redirect

---

### HelpPage
**Arquivo**: `src/components/HelpPage.tsx`

**Responsabilidade**: Central de ajuda com vídeos e busca

**Props**: Nenhuma

**Estados Internos**:
- `selectedVideo`: HelpVideo | null
- `isModalOpen`: boolean
- `query`: string (busca)
- `activeCategory`: string

**Interações**:
- Busca real-time
- Filtro por categoria
- Clique em video → modal

---

## Componentes de Vídeo

### VideoCard
**Arquivo**: `src/components/help/VideoCard.tsx`

**Responsabilidade**: Card individual de vídeo

**Props**:
```typescript
{
  video: HelpVideo;
  onClick: () => void;
}
```

**Renderização**:
- Thumbnail com overlay
- Título + descrição (truncada)
- Duração

---

### VideoModal
**Arquivo**: `src/components/help/VideoModal.tsx`

**Responsabilidade**: Modal para exibir vídeo full

**Props**:
```typescript
{
  video: HelpVideo;
  isOpen: boolean;
  onClose: () => void;
  relatedVideos: HelpVideo[];
}
```

---

### VideoShelf
**Arquivo**: `src/components/help/VideoShelf.tsx`

**Responsabilidade**: Carousel/grid de vídeos relacionados

**Props**:
```typescript
{
  videos: HelpVideo[];
  onVideoClick: (video: HelpVideo) => void;
}
```

---

## Componentes shadcn/ui Utilizados

- **Button**: Botões customizáveis com variants
- **Input**: Inputs de texto
- **Label**: Labels para formulários
- **Textarea**: Áreas de texto grande
- **Card**, **CardContent**, **CardHeader**, **CardTitle**: Cards
- **Dialog**, **DialogContent**, **DialogHeader**, **DialogTitle**, **DialogFooter**: Modais
- **Sheet**, **SheetContent**, **SheetTrigger**: Drawer mobile
- **Select**, **SelectTrigger**, **SelectContent**, **SelectItem**, **SelectValue**: Dropdowns
- **Checkbox**, **Radio Group**: Seleção
- **Badge**: Badges de status
- **Progress**: Barras de progresso
- **ScrollArea**: Scroll areas customizadas
- **Popover**, **PopoverContent**, **PopoverTrigger**: Popovers
- **Toast**, **Toaster**, **useToast**: Sistema de notificações

---

# COMPORTAMENTOS E INTERAÇÕES

## Interações de Usuário

### Hover Effects
- **Cards em geral**: scale 1.05, y -8px, sombra aumenta
- **Botões**: brightness/opacity aumenta, transição suave
- **Links**: cor muda para emerald-400, underline aparece
- **Inputs**: border color muda, ring glow, transition 200ms

### Click/Tap
- **Botões**: Feedback visual imediato
  - `whileTap={{ scale: 0.98 }}` (Framer Motion)
  - Background muda tom
  - Spinner aparece se loading
- **Cards klicáveis**: Modal abre com transição
- **Menu items**: Navegação + highlighting do item ativo

### Scroll
- **Seções em LeadFlow**: Fade-in-up ao viewport via `IntersectionObserver`
- **Vídeos**: Auto-play ao atingir 50% de visibilidade
- **FAQ acordeão**: Suave expand/collapse
- **Kanban**: Scroll horizontal em mobile

### Animações

#### Page Transitions
- `AnimatePresence mode="wait"` (framer-motion)
- Fade-out página anterior
- Fade-in-up página nova
- Duração: ~250ms

#### Element Animations
- **Fade-in-up**: opacity 0 → 1, y 40px → 0, duration 0.8s
- **Stagger**: cada filho tem delay: index * 0.15s
- **Hover animations**: spring physics, stiffness 300, damping 20

#### Loading States
- **Spinner**: rotação contínua `animate-spin`
- **Skeleton**: shimmer effect (background animation)
- **Progress bar**: smooth fill de 0-100%

#### Success/Error
- **Toast notifications**: slide-in from bottom, auto-dismiss 5s
- **Error messages**: bounce + shake (opcional)
- **Success checkmark**: scale from 0 → 1

### Estados de Erro
- **Form validation**: mensagem inline vermelha sob campo
- **API errors**: toast com título e descrição
- **Network errors**: retry button + mensagem
- **404**: página com ícone alert + home link

### Estados de Sucesso
- **Form submit**: toast verde com checkmark
- **File upload**: progress bar completa, preview
- **Delete**: item removido com fade-out
- **Save**: toast com confirmação

---

## Responsividade

### Mobile (<768px)
- **Layout**: Single column, full-width
- **Font sizes**: Base 14px, headings aumentados
- **Spacing**: padding/margin reduzidos
- **Inputs**: Larger tap targets (min 44px)
- **Navigation**: Drawer/sheet em vez de sidebar
- **Modals**: Full-screen em vez de centered
- **Images**: Aspect ratios mantidas, 100% width

### Tablet (768px - 1024px)
- **Layout**: 2 colunas em grids
- **Sidebar**: Colapsável ou hide
- **Font sizes**: Intermediários
- **Cards**: 2 colunas

### Desktop (≥1024px)
- **Layout**: Multi-column, max-w-7xl
- **Sidebar**: Fixed left 256px
- **Font sizes**: Full size
- **Cards**: 3-4 colunas
- **Modals**: Centered, max-w-2xl
- **Hover effects**: Plenos (desktop-only)

---

## Temas de Cores

### Cores Principais
- **Primária**: Emerald-400/500/600 (#10b981)
- **Secundária**: Amber-400/500 (#fbbf24)
- **Accent**: Cyan-400/500 (#06b6d4)
- **Background**: Slate-950/900/800 (#030712 / #111827 / #1e293b)
- **Text**: Slate-50/100/200/300 (#f8fafc / #f1f5f9 / #e2e8f0)
- **Destructive**: Red-500/600 (#ef4444 / #dc2626)
- **Success**: Emerald-500 (#10b981)

### Dark Mode
- Sistema operacionaliza em dark mode por padrão
- Fundo escuro: `bg-slate-950`
- Texto claro: `text-slate-50`
- Inputs: `bg-slate-900 border-slate-700`
- Cards: `bg-slate-900/60 border-slate-800`

---

## Acessibilidade

### ARIA Attributes
- Botões: `aria-label` quando necessário
- Inputs: `htmlFor` em labels
- Imagens: `alt` text descritivo
- Links: `aria-current` em navegação ativa
- Dialogs: `role="dialog"` + gerenciamento de focus

### Keyboard Navigation
- Tab entre elementos interativos
- Enter para ativar buttons
- Escape para fechar modals
- Setas em select/dropdown

### Contrast
- Text: mínimo 4.5:1 contra background
- Interactive elements: mínimo 3:1
- Teste com `axe`, `lighthouse`

---

# FORMULÁRIOS

## Formulário de Login

**Arquivo**: `src/pages/LoginPage.tsx`

**Campos**:
```
1. Email
   - Type: email
   - Required: true
   - Placeholder: "seu@email.com"
   - Mask: nenhuma
   - Validação: email válido (HTML5)

2. Senha
   - Type: password
   - Required: true
   - Placeholder: "•••••••"
   - Mask: nenhuma
   - Validação: não vazio
   - Toggle show/hide: icon eye
```

**Ordem de Preenchimento**:
1. Email (focus automático)
2. Senha
3. Clique em "Entrar" ou Enter

**Validações**:
- Email: formato válido (HTML5 type=email)
- Senha: não vazio (length > 0)
- On submit: credenciais verificadas no Supabase

**Fluxos Alternativos**:
- "Esqueceu a senha?" → WhatsApp link
- "Ainda não tem conta?" → `/signup`
- Erro: mostra mensagem + limpa password

**Mensagens**:
- Sucesso: redirect automático `/sistema`
- Erro: "E-mail ou senha inválidos." (credenciais ruins)
- Erro: "Ocorreu um erro ao tentar fazer login." (erro genérico)

---

## Formulário de Signup

**Arquivo**: `src/pages/SignUpPage.tsx`

**Campos**:
```
1. Nome Completo
   - Type: text
   - Required: true
   - Placeholder: "Ex: João Silva"
   - Validação: não vazio

2. Nome da Loja
   - Type: text
   - Required: true
   - Placeholder: "Ex: Silva Veículos"
   - Validação: não vazio

3. WhatsApp da Loja
   - Type: tel
   - Required: true
   - Placeholder: "Ex: 5546999999999"
   - Validação: não vazio (10+ dígitos)

4. E-mail
   - Type: email
   - Required: true
   - Placeholder: "seu@email.com"
   - Validação: email válido

5. Senha
   - Type: password
   - Required: true
   - Placeholder: "Mínimo 6 caracteres"
   - Validação: length >= 6
```

**Ordem de Preenchimento**:
1. Nome (focus automático)
2. Loja
3. WhatsApp
4. Email
5. Senha
6. Clique em "Criar Conta e Pagar"

**Validações**:
- Step 1: nome, loja não vazios
- Step 2: whatsapp válido (10+ dígitos)
- Step 3: email formato válido
- Step 4: senha >= 6 caracteres (validação JS)
- On submit: todos campos obrigatórios

**Fluxos Alternativos**:
- Senha < 6 → erro "A senha deve ter no mínimo 6 caracteres."
- Erro de API → erro "Não foi possível criar conta..."
- Sucesso → redirect para Stripe Checkout

**Mensagens**:
- Erro validação: mensagem inline
- Erro API: toast + message display

---

## Formulário de Proposta de Veículo (PublicCarFormPage)

**Arquivo**: `src/pages/PublicCarFormPage.tsx` + `src/components/AddClient.tsx`

**Estrutura Multi-Step**: 5 passos

### Step 0: Tipo de Negociação

**Campos**:
```
Radiobuttons (3 opções mutuamente exclusivas):
1. [ ] Compra comum
2. [ ] Troca de veículo
3. [ ] Visita agendada

Seleção obrigatória
```

**Lógica**:
- Seleção determina steps subsequentes
- Comum: → Step 1 → Step 3a (financiamento) → Step 4 → Submit
- Troca: → Step 1 → Step 2a (seleção) → Step 2b (fotos) → Step 4 → Submit
- Visita: → Step 1 → Step 3b (agendamento) → Step 4 → Submit

---

### Step 1: Dados Pessoais

**Campos**:
```
1. Nome Completo
   - Type: text
   - Required: true
   - Min length: 3
   - Max length: 100
   - Placeholder: "Seu nome completo"

2. CPF
   - Type: text
   - Required: true
   - Mask: XXX.XXX.XXX-XX
   - Validação: 11 dígitos válidos
   - Placeholder: "000.000.000-00"

3. Telefone / WhatsApp
   - Type: tel
   - Required: true
   - Mask: (XX) XXXXX-XXXX
   - Validação: 10-11 dígitos
   - Placeholder: "(46) 99999-9999"

4. Profissão / Trabalho
   - Type: text
   - Required: true
   - Placeholder: "Ex: Programador"
   - Validação: não vazio

5. Estado / Localização
   - Type: select (dropdown)
   - Required: true
   - Options: Todos os 27 estados BR
   - Default: "Selecione..."
   - Validação: não vazio
```

**Ordem**:
1. Nome (autofocus)
2. CPF
3. Telefone
4. Profissão
5. Estado
6. Próximo

**Validações**:
- Nome: não vazio, min 3
- CPF: mask + 11 dígitos
- Telefone: mask + 10-11 dígitos
- Profissão: não vazio
- Estado: selecionado
- On next: todas validações rodam, erros inline

**Erros**:
- Mostrados inline em vermelho sob campo
- Campos inválidos recebem border vermelha
- Submit bloqueado se há erro

---

### Step 2a: Seleção de Veículos de Troca (condicional)

**Campos**:
```
Checkbox list (múltipla seleção):
- Busca catálogo da loja (API: fetchAvailableCars)
- Cada item:
  [ ] Nome Veiculo | Ano | Preço
  - Miniatura imagem

- Min seleção: 1
- Max seleção: 3
- Default: nenhum selecionado
```

**Validações**:
- Mínimo 1 selecionado
- Error: "Selecione pelo menos um veículo de troca"

---

### Step 2b: Fotos de Troca (condicional)

**Campos**:
```
File upload (múltiplo):
- Drag & drop ou file picker
- Accept: image/jpeg, image/png, image/webp
- Max files: 5
- Max size per file: 5MB (antes compressão)
- Auto-compress: sim (browser-image-compression)
- Preview: grid de thumbnails com remove button

Validações:
- Min files: 1
- Max files: 5
- Max size: 5MB por arquivo
- Format: JPG/PNG/WEBP apenas
```

---

### Step 3a: Financiamento (condicional - se "Comum")

**Campos**:
```
1. Tipo de Pagamento
   - Radio buttons:
     ( ) À vista
     ( ) Financiado
     ( ) Troca + Financiado

2. Se "Financiado" ou "Troca + Financiado":
   
   a) Entrada
      - Type: text
      - Mask: BRL (X.XXX,XX)
      - Required: true
      - Min: 0.01
      - Max: preço do veículo
      - Placeholder: "R$ 0,00"
      - Validação: > 0, ≤ preço

   b) Parcelas
      - Type: number
      - Required: true
      - Min: 1
      - Max: 84
      - Default: 12
      - Placeholder: "12"
      - Validação: 1-84
```

**Cálculos Automáticos**:
- Valor a financiar = preço do veículo - entrada
- Valor por parcela = valor a financiar / parcelas
- Display: "Total a financiar: R$ X.XXX,00"
- Display: "Valor/parcela: R$ XXX,XX"

**Validações**:
- Entrada > 0
- Entrada ≤ preço do veículo
- Parcelas entre 1-84
- Cálculos validam na submissão

---

### Step 3b: Agendamento de Visita (condicional - se "Visita")

**Campos**:
```
1. Data da Visita
   - Type: date (date picker)
   - Required: true
   - Min: hoje + 1 dia
   - Max: 90 dias no futuro
   - Format: DD/MM/YYYY
   - Validação: data válida, > hoje

2. Hora da Visita
   - Type: time
   - Required: true
   - Min: 08:00
   - Max: 18:00
   - Step: 30 minutos
   - Default: 10:00
   - Format: HH:MM
   - Validação: dentro horário comercial

3. Vendedor (opcional)
   - Type: select
   - Busca: lista de vendedores da loja
   - Options: dropdown com nomes
   - Default: "Qualquer vendedor"
   - Validação: não obrigatória

4. Observações (opcional)
   - Type: textarea
   - Placeholder: "Ex: Gostaria de testar o modelo X..."
   - Max length: 500
```

**Validações**:
- Data: > hoje, ≤ 90 dias
- Hora: 08:00-18:00
- Observações: max 500 chars

---

### Step 4: Review & Confirmação

**Campos** (read-only com "Editar" links):
```
Card 1: Tipo de Negociação
├─ Ícone
├─ Label
├─ Seleção
└─ Link "Editar" → volta Step 0

Card 2: Dados Pessoais
├─ Nome
├─ CPF (mascarado: XXX.XXX.XXX-XX)
├─ Telefone (mascarado)
├─ Profissão
├─ Estado
└─ Link "Editar" → volta Step 1

Card 3: Veículos (se aplicável)
├─ Lista de selecionados
└─ Link "Editar" → volta Step 2a

Card 4: Fotos (se troca)
├─ Grid de thumbnails (4 colunas)
└─ Link "Editar" → volta Step 2b

Card 5: Financiamento (se aplicável)
├─ Tipo
├─ Entrada
├─ Parcelas
├─ Total a financiar
└─ Link "Editar" → volta Step 3a

Card 6: Visita (se aplicável)
├─ Data + Hora
├─ Vendedor
├─ Observações
└─ Link "Editar" → volta Step 3b

Buttons:
├─ "← Voltar" (previous step)
├─ "Enviar Proposta" (POST)
└─ "Cancelar" (home)
```

**Validações**:
- Todos os campos revisados são readonly
- Submit valida novamente antes de POST

---

## Formulário de Adicionar Veículo

**Arquivo**: `src/components/AddVehicle.tsx`

**Estrutura Multi-Step**: 5 passos

### Step 1: Informações Básicas

**Campos**:
```
Grid 2 col (mobile 1):

1. Nome / Modelo
   - Type: text
   - Required: true
   - Min: 3
   - Max: 100
   - Placeholder: "Ex: Toyota Corolla"
   - Validação: não vazio, min 3

2. Ano
   - Type: number
   - Required: true
   - Min: 1900
   - Max: 2027
   - Placeholder: "2024"
   - Validação: 1900-2027

Lado a lado (grid 2 col):

3. Preço
   - Type: text
   - Required: true
   - Mask: BRL (X.XXX,XX)
   - Placeholder: "R$ 0,00"
   - Validação: > 0
```

**Validações**:
- Nome: obrigatório, min 3 chars
- Ano: number, 1900-2027
- Preço: > 0, formato BRL

---

### Step 2: Descrição

**Campos**:
```
1. Descrição (opcional)
   - Type: textarea
   - Max: 1000 characters
   - Placeholder: "Descreva features, quilometragem, histórico de manutenção..."
   - Counter: "0/1000"
   - Validação: max 1000
```

---

### Step 3: Imagens

**Campos**:
```
1. Upload de Múltiplas Imagens
   - Drag & drop zone
   - File picker (accept: image/*)
   - Required: min 1
   - Max: 10 arquivos
   - Max size: 5MB por arquivo
   - Auto-compress: sim
   - Preview grid com:
     - Thumbnail
     - Compression % indicator
     - Remove button
   - Progress bar durante compressão/upload

Validações:
- Min 1 imagem
- Max 10 imagens
- Max 5MB por imagem
- Apenas imagens (JPG/PNG/WEBP)
```

---

### Step 4: Review

**Campos** (read-only):
```
Card de review:
├─ Nome + Ano
├─ Preço
├─ Descrição (truncada ou full)
├─ Contador de imagens
├─ "Clique em Próximo para confirmar"
└─ Botões: "← Voltar", "Publicar Veículo →"
```

---

### Step 5: Sucesso

**Renderização**:
```
├─ Ícone check (green, scale animation)
├─ "Veículo cadastrado com sucesso! 🎉"
├─ "Seu veículo foi adicionado ao catálogo."
├─ Button "Ver no catálogo" → /sistema/catalog
└─ Button "Cadastrar outro veículo" → reset form, volta Step 1
```

---

# FLUXOS DE TELAS

## Fluxo do Visitante

```
1. [HomePage] (/)
   ├─ Vê hero com proposta
   ├─ Clique em "Conhecer Zailon Auto"
   └─ → [LeadFlow]

2. [LeadFlow] (/ZailonAuto)
   ├─ Vê vídeos, features, FAQ
   ├─ Scroll pelas seções
   ├─ Opção 1: Clique em "Abrir Catálogo da Loja"
   │   └─ → [PublicVehicleCatalogPage]
   ├─ Opção 2: Clique em "Quero meu software sob medida"
   │   └─ → WhatsApp link
   └─ Opção 3: Clique em botão CTA no hero
       └─ → [SignUpPage] ou [LoginPage]

3. [PublicVehicleCatalogPage] (/catalogo-loja/:lojaId)
   ├─ Vê lista de veículos
   ├─ Busca / Filtra
   ├─ Clique em veículo
   ├─ → Modal com detalhes
   ├─ Clique em "Enviar Proposta"
   └─ → [PublicCarFormPage]

4. [PublicCarFormPage] (/form-proposta/:carId)
   ├─ Step 0: Tipo de negociação
   ├─ Step 1: Dados pessoais
   ├─ Step 2: Veículos/Fotos (se troca) ou Financiamento (se comum) ou Visita (se visita)
   ├─ Step 4: Review
   ├─ Clique em "Enviar Proposta"
   ├─ POST → Supabase `clients` table
   ├─ Toast: "Proposta enviada com sucesso!"
   └─ Redirect → [HomePage] ou [PublicVehicleCatalogPage]

5. [HomePage] (volta)
   ├─ Visitante vê CTA "Quero meu próprio sistema"
   ├─ Clique em "Cadastre-se"
   └─ → [SignUpPage]

6. [SignUpPage] (/signup)
   ├─ Preenche formulário
   ├─ Clique em "Criar Conta e Pagar"
   ├─ POST → Supabase `start-subscription` function
   ├─ Retorna `checkoutUrl`
   ├─ Redirect para Stripe Checkout
   ├─ Cliente realiza pagamento
   ├─ Sucesso → Stripe redireciona para `/sistema`
   ├─ Webhook atualiza subscription status para 'active'
   └─ → [Dashboard] (já autenticado)
```

## Fluxo do Usuário Autenticado (Cliente)

```
1. [LoginPage] (/login)
   ├─ Usuário faz login
   ├─ POST auth credenciais
   ├─ Sucesso → ProtectedRoute verifica status
   ├─ Se status = 'active' → libera acesso
   └─ → [Index/MainLayout] → [Dashboard]

2. [Dashboard] (/sistema/dashboard)
   ├─ Vê métricas e funil
   ├─ Clique em card → abre modal
   ├─ Clique em menu → navega
   └─ Opções de navegação:
      ├─ Dashboard (ativo)
      ├─ Catálogo
      ├─ CRM
      ├─ Novo Veículo
      ├─ Configurações
      └─ Sair

3a. [VehicleCatalog] (/sistema/catalog)
   ├─ Vê lista de veículos
   ├─ Busca / Ordena
   ├─ Clique em veículo → abre modal
   ├─ Modal: View detalhes ou Edit
   ├─ Edit: Alterar dados, remover/adicionar imagens
   ├─ Clique em "Novo Veículo"
   └─ → [AddVehicle]

3b. [AddVehicle] (/sistema/add-vehicle)
   ├─ Step 1: Nome, Ano, Preço
   ├─ Step 2: Descrição (opcional)
   ├─ Step 3: Imagens (drag-drop)
   ├─ Step 4: Review
   ├─ Clique em "Publicar Veículo"
   ├─ POST → Supabase
   ├─ Step 5: Sucesso
   └─ → [VehicleCatalog] ou [Dashboard]

4. [CRMKanban] (/sistema/crm)
   ├─ Vê funil de leads em Kanban
   ├─ Arrasta leads entre colunas
   ├─ Clique em lead → abre modal
   ├─ Modal: Editar, Gerar PDF, Deletar, Enviar WhatsApp
   ├─ "Gerar PDF" → download proposta
   ├─ "Enviar WhatsApp" → link wa.me
   └─ Clique em menu → navega

5. [StoreSettingsPage] (/sistema/settings)
   ├─ Tab Loja: Editar dados da loja, logo
   ├─ Tab Vendedores: Listar, adicionar, remover
   ├─ Clique em "Salvar" → PUT dados
   ├─ Toast de sucesso/erro
   └─ Clique em menu → navega

6. [HelpPage] (/sistema/help)
   ├─ Vê central de ajuda
   ├─ Busca vídeos (real-time)
   ├─ Filtra por categoria
   ├─ Clique em vídeo → abre modal
   ├─ Modal: Assiste vídeo, vê relacionados
   └─ Clique em menu → navega

7. Logout
   ├─ Clique em "Sair" no menu
   ├─ Mutation logout (clear cache, signOut)
   └─ Redirect → [LoginPage]
```

## Fluxo de Problema com Pagamento

```
1. Cliente tem assinatura mas falha na renovação
   ├─ Webhook atualiza subscription status para 'unpaid'

2. Cliente tenta acessar /sistema
   ├─ ProtectedRoute valida
   ├─ status = 'unpaid'
   ├─ Redireciona para /assinar
   └─ → [SubscribePage]

3. [SubscribePage] (/assinar)
   ├─ Vê tela de "Pagamento recusado"
   ├─ Clique em "Regularizar pagamento agora"
   ├─ Chamada para `create-customer-portal-link`
   ├─ Retorna link do Stripe Customer Portal
   ├─ Redirect para Stripe Portal
   ├─ Cliente atualiza cartão
   ├─ Webhook atualiza status para 'active'
   ├─ Cliente retorna do portal
   ├─ Pode acessar /sistema normalmente
   └─ → [Dashboard]
```

## Fluxo de Primeira Assinatura Cancelada/Incompleta

```
1. Cliente criou conta mas não completou pagamento
   ├─ Subscription status = 'canceled', 'pending_payment', ou 'incomplete'

2. Cliente tenta acessar /sistema
   ├─ ProtectedRoute valida
   ├─ status ≠ 'active' e ≠ 'unpaid'
   ├─ Redireciona para /ativar-conta
   └─ → [ActivateAccountPage]

3. [ActivateAccountPage] (/ativar-conta)
   ├─ Vê tela "Ative sua Conta"
   ├─ Clique em "Pagar Mensalidade e Ativar"
   ├─ Chamada para `create-checkout-link`
   ├─ Retorna URL de checkout Stripe
   ├─ Redirect para Stripe Checkout
   ├─ Cliente realiza pagamento
   ├─ Sucesso → Stripe redireciona para `/sistema`
   ├─ Webhook atualiza status para 'active'
   └─ → [Dashboard] (acesso concedido)
```

---

**FIM DE DOCUMENTACAO_UI.md**

Agora vou criar este arquivo no projeto:
