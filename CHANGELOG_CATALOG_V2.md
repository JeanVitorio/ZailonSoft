# Changelog - Catálogo v2.0 Redesign

## 🚀 Nova Versão: Catálogo Público Redesenhado (v2.0)

### Data de Release
**1 de Fevereiro de 2026**

### 📋 Resumo
Redesign completo do catálogo público com foco em experiência de compra estilo Instagram, integração de formulário de leads multi-step e tema visual modernizado (amarelo/verde/preto com glass-morphism).

---

## ✨ Principais Mudanças

### 🎨 Design & UI
- **Layout 2-Coluna Responsivo**: Galeria + info à esquerda, vídeos + CTA à direita (desktop)
- **Mobile-First**: Stack em coluna única com CTA fixo na base
- **Glass Morphism**: Efeito de vidro translúcido em cards e containers
- **Tema Atualizado**: Amarelo (primary), Verde (accent), Preto (background)
- **Tipografia Premium**: Space Grotesk para headings, Inter para body
- **Animações Suaves**: Framer Motion para transições naturais

### 🔍 Funcionalidades Públicas

#### Catálogo de Veículos (`PublicCatalogPage.tsx`)
- ✅ Grid responsivo com Framer Motion animations
- ✅ **Busca em tempo real** (nome, modelo, ano, preço)
- ✅ **Filtros avançados**:
  - Faixa de ano (slider)
  - Faixa de preço (slider)
  - Marca (dropdown)
  - Modelo (texto livre)
- ✅ Cards com overlay "Ver detalhes" CTA
- ✅ Paginação com carregamento infinito

#### Detalhe do Veículo (`PublicVehicleDetailPage.tsx`)
- ✅ **Galeria de imagens** com navegação
- ✅ **Vídeos do veículo** em VideoReels com scroll snap
- ✅ **Informações principais**:
  - Marca, modelo, preço com gradient text
  - Ano, quilometragem, tipo de veículo (badges)
  - Descrição detalhada
  - Lista de destaques/features
- ✅ **CTAs Funcionais**:
  - Desktop: botão na coluna direita (py-6, btn-primary)
  - Mobile: botão fixo na base com glass-card
- ✅ **Botões sociais**: Favorite (❤️) e Share
- ✅ LeadForm modal integrado

### 📝 LeadForm Multi-Step

#### Fluxo de Leads
1. **Dados Pessoais**: Nome, email, telefone, CPF
2. **Tipo de Interesse**: Venda, Troca, Visita
3. **Detalhes Financeiros/Trade-in**:
   - Se financiamento: entrada, prazo
   - Se trade-in: foto do veículo
   - Se cash: confirmação
4. **LGPD & CNH**: Upload CNH, checkbox consent
5. **Sucesso**: Confirmation screen

#### Integração Supabase
- ✅ Upload de CNH para Storage (`/leads` bucket)
- ✅ Upload de fotos de trade-in para Storage
- ✅ Salvar registro de lead na tabela `leads` com:
  - Dados pessoais (nome, email, tel, CPF)
  - Info do veículo (ID, nome, marca)
  - Tipo de interesse
  - Dados financeiros/trade-in
  - LGPD consent
  - Timestamps (created_at)

### 🎯 Melhorias Técnicas

#### Componentes
- `PublicCatalogPage.tsx` - Página principal do catálogo
- `PublicVehicleDetailPage.tsx` - Detalhe do veículo
- `LeadForm.tsx` - Formulário multi-step (nova versão)
- `Filters.tsx` - Painel de filtros com brand/model inputs
- `ImageGallery.tsx` - Carrossel de imagens
- `VideoReels.tsx` - Vídeos com scroll snap
- `VehicleCard.tsx` - Card individual com CTA overlay

#### Types & Services
- `src/types/vehicle.ts` - Tipagem para Vehicle, LeadData, InterestType
- `src/services/api.ts` - Fetch car details, create leads
- `src/services/analytics.ts` - Shared Supabase client (fix: removeu duplicate GoTrueClient)

#### Styling
- CSS Variables customizadas (yellow/green/black theme)
- Tailwind classes: `bg-background`, `bg-secondary`, `glass-card`, `btn-primary`, `gradient-text`
- Animações: `animate-pulse-glow` (novo keyframe)

---

## 🔧 Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/PublicVehicleDetailPage.tsx` | ✅ Reescrito 100% idêntico ao Drive-Connect v1 |
| `src/pages/PublicCatalogPage.tsx` | ✅ Adicionada busca real-time e filtros |
| `src/components/public-catalog/LeadForm.tsx` | ✅ Multi-step completo com Supabase |
| `src/components/public-catalog/Filters.tsx` | ✅ Filtros avançados (brand, model, year, price) |
| `src/components/ui/VehicleCard.tsx` | ✅ "Ver detalhes" CTA overlay adicionado |
| `src/services/analytics.ts` | ✅ Shared Supabase client (GoTrueClient fix) |
| `src/index.css` | ✅ Theme vars atualizado, classes CSS novas |
| `tailwind.config.ts` | ✅ Cores e gradientes do novo tema |
| `src/types/vehicle.ts` | ✨ Novo arquivo - Tipagem completa |

---

## 🚀 Como Usar

### Iniciar Dev Server
```bash
npm run dev
# Abrirá em http://localhost:8081
```

### Acessar Catálogo Público
- Home: `http://localhost:8081/`
- Catálogo: `http://localhost:8081/catalogo/1`
- Detalhe do Veículo: `http://localhost:8081/catalogo/1/[vehicle-id]`

### Testar LeadForm
1. Abra qualquer página de detalhe de veículo
2. Clique no botão "Tenho Interesse"
3. Preencha o formulário multi-step
4. Upload de CNH (simulado com arquivo test)
5. Aceite LGPD
6. Verifique no Supabase:
   - Storage: `/leads/[CPF]/CNH_[timestamp].jpg`
   - Table `leads`: novo registro com todos os dados

---

## 🎨 Tema Visual

### Paleta de Cores
- **Primary (Amarelo)**: `hsl(45 100% 50%)` - Botões, destaques
- **Secondary (Cinza escuro)**: `hsl(0 0% 12%)` - Backgrounds
- **Accent (Verde)**: `hsl(142 71% 45%)` - Botões accent
- **Background (Preto)**: `hsl(0 0% 0%)` - Base
- **Foreground (Branco)**: `hsl(0 0% 95%)` - Texto

### Componentes Visuais
- `glass-card` - Background translúcido com backdrop blur
- `gradient-text` - Texto com gradient amarelo
- `btn-primary` - Botão amarelo com hover effects
- `badge-notion` - Badges com background amarelo claro

---

## 🐛 Correções de Bugs

- ✅ **Preco initialization**: Corrigido erro "Cannot access 'preco' before initialization"
- ✅ **LeadForm corruption**: Removido arquivo corrupto, criado novo com safe fallbacks
- ✅ **GoTrueClient duplicate**: Removido múltiplas instâncias em analytics.ts
- ✅ **ImageGallery props**: Corrigido prop mismatch (name → alt)

---

## 📦 Dependências Principais

- `react@18.3.1`
- `react-router-dom@6.x`
- `framer-motion@10.x`
- `@tanstack/react-query@5.x`
- `tailwindcss@3.x`
- `shadcn/ui` components
- `lucide-react` icons
- `@supabase/supabase-js` (Supabase client)

---

## 🔮 Próximas Features (Roadmap)

- [ ] Google Maps integration para localização de concessionárias
- [ ] Agendamento de test drive
- [ ] Comparação de veículos (side-by-side)
- [ ] Calculadora de financiamento
- [ ] Reviews/ratings de clientes
- [ ] Notificações de novos veículos
- [ ] WhatsApp integration para leads
- [ ] Dashboard de leads para admin

---

## 👥 Equipe

- **Design**: Instagram-like catalog UI + glass-morphism
- **Development**: React + TypeScript + Vite
- **Backend**: Supabase (Auth, Storage, Database)

---

## 📝 Notas

- Tag de release: `catalog-v2.0-redesign`
- Commit: `00424e5`
- Branch: `master`
- Data: 01/02/2026

---

**Status**: ✅ **Production Ready** - Testado em dev e build
