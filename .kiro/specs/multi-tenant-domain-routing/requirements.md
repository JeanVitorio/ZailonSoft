# Requirements Document

## Introduction

O sistema **Falcon** é um SaaS de gestão de lojas de veículos (concessionárias/revendas) com modelo multi-tenant. Atualmente, cada tenant é identificado por um segmento de path na URL (ex: `bvstech.com/vezmultimarcas`). Esta feature migra a identificação do tenant de **path-based** para **domain-based**: cada loja passa a ter seu próprio domínio personalizado (ex: `vezmultimarcas.com.br`), tornando a experiência do cliente final completamente transparente ao SaaS subjacente. O tenant é resolvido no frontend a partir de `window.location.hostname`, injetado em um contexto React e utilizado por todas as rotas públicas e do painel administrativo.

---

## Glossary

- **Falcon**: O sistema SaaS de gestão de lojas de veículos.
- **Tenant**: Uma loja (concessionária/revenda) que utiliza o Falcon como plataforma.
- **Tenant_Resolver**: Módulo (hook + contexto) responsável por determinar o tenant ativo a partir do hostname atual.
- **TenantContext**: Contexto React que armazena os dados do tenant resolvido e expõe o estado de resolução para a aplicação.
- **Hostname**: Valor de `window.location.hostname` normalizado (lowercase, sem porta, sem prefixo `www.`).
- **Dominio**: Coluna na tabela `lojas` que armazena o domínio personalizado de um tenant (único, normalizado, sem `www.`).
- **Loja**: Registro na tabela `lojas` do Supabase representando um tenant.
- **Slug**: Identificador textual da loja usado no modelo path-based legado.
- **Domínio Genérico**: O domínio raiz da plataforma Falcon (ex: `bvstech.com`), usado no período de transição.
- **Período de Transição**: Janela de tempo em que ambos os modelos (domain-based e path-based) coexistem.
- **Rota Pública**: Rota acessível sem autenticação — catálogo e detalhe de veículo.
- **Rota Admin**: Rota sob `/admin/*` que exige autenticação e pertencimento ao tenant resolvido.
- **AuthContext**: Contexto React existente que gerencia sessão do usuário lojista.
- **Cache de Tenant**: Mecanismo em memória (ex: `useRef` ou módulo singleton) que armazena o resultado da resolução de tenant para evitar queries repetidas ao Supabase.

---

## Requirements

### Requisito 1: Modelo de Dados — Domínio Personalizado por Loja

**User Story:** Como desenvolvedor da plataforma, quero que cada loja possa ter um domínio personalizado cadastrado, para que o sistema consiga resolver o tenant correto a partir do hostname acessado.

#### Critérios de Aceitação

1. THE **Falcon** SHALL manter a coluna `dominio` do tipo `TEXT` com constraint `UNIQUE` nullable na tabela `lojas` do Supabase, de modo que cada loja pode ter no máximo um domínio personalizado e lojas ainda não migradas armazenam `NULL`.
2. WHEN um domínio é escrito na coluna `dominio` via INSERT ou UPDATE, THE **Falcon** application layer SHALL normalizar o valor para lowercase e remover o prefixo `www.` antes de enviar a escrita ao Supabase, de forma que o valor persistido nunca contenha letras maiúsculas nem o prefixo `www.`.
3. WHEN uma tentativa de INSERT ou UPDATE tentar armazenar um domínio já existente na coluna `dominio` de outro registro da tabela `lojas`, THE **Falcon** SHALL rejeitar a operação retornando um erro de conflito de chave única (código Supabase `23505`), sem alterar nenhum registro existente.
4. WHEN um valor é submetido para a coluna `dominio`, THE **Falcon** SHALL rejeitar valores que não satisfaçam o formato de domínio válido: 1–253 caracteres, composto por labels alfanuméricos separados por pontos, onde cada label pode conter hífens mas não pode começar ou terminar com hífen, e o valor não pode conter espaços, barras nem caracteres especiais além de hífens e pontos.
5. WHERE suporte a múltiplos domínios por loja for necessário no futuro, THE **Falcon** SHALL permitir a criação de uma tabela separada `dominios_loja` (relação 1:N entre `lojas` e domínios) sem exigir remoção ou alteração da coluna `dominio` existente na tabela `lojas`.
6. THE **Falcon** SHALL expor o campo `dominio` como `string | null` na interface `LojaDetails` do serviço `api.ts`, de modo que todas as funções que retornam `LojaDetails` incluam o campo `dominio` na resposta.

---

### Requisito 2: Resolução de Tenant por Domínio (Tenant Resolver)

**User Story:** Como visitante de uma loja, quero que ao acessar o domínio personalizado da loja o sistema identifique automaticamente qual loja exibir, sem que eu precise navegar por caminhos adicionais na URL.

#### Critérios de Aceitação

1. WHEN a aplicação Falcon é carregada no browser, THE **Tenant_Resolver** SHALL ler `window.location.hostname` e normalizar o valor para lowercase, removendo a porta (se presente) e o prefixo `www.`, produzindo um hostname canônico usado em todas as etapas seguintes.
2. WHEN o hostname normalizado é obtido, THE **Tenant_Resolver** SHALL consultar a tabela `lojas` no Supabase buscando o registro onde `dominio = hostname`, usando a chave anon pública.
3. WHEN a consulta ao Supabase retorna um registro de loja, THE **TenantContext** SHALL armazenar os dados da loja resolvida (ao menos `id`, `slug`, `nome`, `logo_url`, `dominio`) e expor o estado `{ loading: false, resolved: true, loja: LojaDetails }` para todos os componentes consumidores.
4. IF a consulta ao Supabase não retornar nenhum registro para o hostname normalizado, THEN THE **TenantContext** SHALL expor o estado `{ loading: false, resolved: false, cause: 'domain_not_found' }`, e o **Falcon** SHALL renderizar a página `DomainNotFound` para todas as rotas daquele hostname.
5. IF a consulta ao Supabase não retornar resposta em até **8 segundos** ou retornar um erro de rede/HTTP 5xx, THEN THE **TenantContext** SHALL expor o estado `{ loading: false, resolved: false, cause: 'lookup_error' }`, e o **Falcon** SHALL renderizar a página `DomainLookupError` com um botão de "Tentar novamente" que descarta o cache e inicia uma nova consulta.
6. WHILE a consulta ao Supabase estiver em andamento, THE **TenantContext** SHALL expor o estado `{ loading: true }`, e o **Falcon** SHALL renderizar um indicador de carregamento que ocupa toda a viewport e bloqueia interações do usuário com o conteúdo da aplicação.
7. WHEN o tenant for resolvido com sucesso, THE **Tenant_Resolver** SHALL armazenar o resultado em um cache em memória com escopo de page-load (dura até o próximo reload/navegação completa), de forma que re-renders do `TenantProvider` não disparem novas queries ao Supabase enquanto o usuário permanece na mesma página carregada.
8. THE **Tenant_Resolver** SHALL iniciar a consulta ao Supabase exatamente uma vez por page-load, independente da quantidade de re-renders do componente `TenantProvider` ou dos componentes filhos.

---

### Requisito 3: Estrutura de Rotas Domain-Based

**User Story:** Como lojista ou visitante, quero que as URLs da minha loja sejam limpas e relativas à raiz do domínio, para que a experiência do cliente final não exponha detalhes técnicos do SaaS.

#### Critérios de Aceitação

1. WHEN o **TenantContext** expõe `resolved: true`, THE **Falcon** SHALL renderizar a rota `/` como o catálogo público (`PublicCatalog`) da loja resolvida, sem exigir nenhum parâmetro de path adicional além da raiz do domínio.
2. WHEN o **TenantContext** expõe `resolved: true`, THE **Falcon** SHALL renderizar a rota `/veiculo/:id` como a página de detalhe público (`PublicVehicleDetail`) do veículo identificado por `:id`, pertencente exclusivamente à loja resolvida pelo domínio.
3. WHEN o **TenantContext** expõe `resolved: true`, THE **Falcon** SHALL disponibilizar a rota `/admin/login` como ponto de entrada de autenticação do lojista daquela loja, sem redirecionar visitantes não autenticados para esta rota quando eles acessam `/` ou `/veiculo/:id`.
4. WHEN o **TenantContext** expõe `resolved: true` e o lojista está autenticado, THE **Falcon** SHALL renderizar as rotas sob `/admin/*` como o painel administrativo restrito à loja resolvida pelo domínio.
5. WHEN o **TenantContext** expõe `resolved: false` com qualquer causa, THE **Falcon** SHALL renderizar a página de erro correspondente para todas as rotas do domínio, sem expor o catálogo, login ou painel administrativo.
6. IF um usuário não autenticado acessa qualquer rota sob `/admin/*` (exceto `/admin/login`), THEN THE **Falcon** SHALL redirecionar para `/admin/login`, preservando a rota original no parâmetro `returnTo` da query string (ex: `/admin/login?returnTo=/admin/dashboard`), para que após login bem-sucedido o usuário seja enviado à rota originalmente solicitada.
7. IF um usuário já autenticado com sessão válida para o tenant resolvido acessa `/admin/login`, THEN THE **Falcon** SHALL redirecionar imediatamente para `/admin/dashboard`, sem renderizar o formulário de login.

---

### Requisito 4: Adaptação dos Componentes ao TenantContext

**User Story:** Como desenvolvedor, quero que os componentes existentes (`PublicCatalog`, `PublicVehicleDetail`) consumam o tenant a partir do `TenantContext` em vez de `useParams`, para que funcionem corretamente no modelo domain-based.

#### Critérios de Aceitação

1. WHEN operando em modo domain-based, THE **PublicCatalog** SHALL obter o `lojaSlug` e o `lojaId` exclusivamente do **TenantContext** (`useTenant()`), sem ler `useParams()` para esses valores, de modo que a rota `/` não necessite do segmento `/:lojaSlug` no path.
2. WHEN operando em modo domain-based, THE **PublicVehicleDetail** SHALL obter o `lojaSlug` exclusivamente do **TenantContext** e o parâmetro `:id` exclusivamente de `useParams()`, sem misturar as duas fontes para o mesmo dado.
3. WHEN o **TenantContext** expõe `loading: true`, THE **PublicCatalog** e THE **PublicVehicleDetail** SHALL renderizar apenas o estado de carregamento (spinner ou skeleton), sem disparar nenhuma query ao Supabase, e SHALL aguardar o estado `loading: false` antes de iniciar qualquer fetch de dados da loja.
4. WHEN o **TenantContext** expõe `resolved: false` com qualquer causa, THE **PublicCatalog** e THE **PublicVehicleDetail** SHALL renderizar a página de erro correspondente ao valor de `cause` (`DomainNotFound` ou `DomainLookupError`), sem renderizar nenhum dado de veículo ou loja.
5. WHEN o usuário não está autenticado e o **TenantContext** expõe `resolved: true`, THE **DataContext** SHALL utilizar o `lojaId` proveniente do **TenantContext** como fonte primária para identificar o tenant, de forma que os dados públicos da loja (veículos, detalhes) sejam carregados corretamente mesmo sem sessão ativa no **AuthContext**.

---

### Requisito 5: Autenticação e Validação de Tenant no Painel Admin

**User Story:** Como lojista, quero que minha sessão esteja amarrada ao domínio que acesso, para que não seja possível acessar o painel de outra loja usando minha sessão.

#### Critérios de Aceitação

1. WHEN um lojista conclui o login em `/admin/login` com credenciais válidas, THE **AuthContext** SHALL armazenar o `lojaId` retornado pelo **TenantContext** no momento do login como parte do contexto de sessão, de forma que operações subsequentes do painel usem esse `lojaId` como identificador do tenant.
2. WHEN uma rota sob `/admin/*` é acessada com sessão ativa, THE **Falcon** SHALL comparar o `lojaId` armazenado na sessão com o `lojaId` exposto pelo **TenantContext** no hostname atual; se os valores forem iguais, a navegação prossegue normalmente.
3. IF o `lojaId` da sessão ativa divergir do `lojaId` do tenant resolvido pelo domínio atual, THEN THE **Falcon** SHALL encerrar a sessão (signOut), limpar o cache de dados e redirecionar o usuário para `/admin/login` no domínio atual, exibindo a mensagem "Acesso negado: esta sessão pertence a outra loja."
4. WHEN o lojista aciona o logout, THE **AuthContext** SHALL redirecionar para `/admin/login` como caminho relativo dentro do domínio atual (sem redirecionar para um domínio diferente), de modo que o lojista permaneça no domínio da sua loja após o logout.
5. IF um usuário não autenticado requisita as rotas `/` ou `/veiculo/:id`, THE **Falcon** SHALL renderizar o catálogo público sem exibir o formulário de login, botão de acesso ao painel ou qualquer elemento que leve à rota `/admin/login`.

---

### Requisito 6: Período de Transição — Compatibilidade com Path-Based

**User Story:** Como operador da plataforma, quero que lojas ainda não migradas continuem funcionando no modelo path-based, para que a migração possa ser feita de forma gradual sem interrupção de serviço.

#### Critérios de Aceitação

1. WHEN o hostname normalizado da requisição for igual ao valor da variável de ambiente `VITE_PLATFORM_DOMAIN` (ex: `bvstech.com`), THE **Tenant_Resolver** SHALL ativar o modo de compatibilidade path-based e não executar nenhuma query de resolução por domínio na tabela `lojas`, de forma que todas as rotas legadas permaneçam funcionais sem alteração.
2. WHILE o modo de compatibilidade path-based estiver ativo, THE **Falcon** SHALL manter as rotas `/loja/:lojaSlug` (catálogo público) e `/loja/:lojaSlug/veiculo/:id` (detalhe público) funcionais e retornando o mesmo conteúdo que retornavam antes desta feature.
3. WHILE o modo de compatibilidade path-based estiver ativo, THE **Falcon** SHALL manter as rotas de painel `/:lojaSlug/dashboard`, `/:lojaSlug/catalogo`, `/:lojaSlug/crm` e demais sub-rotas sob `/:lojaSlug/*` funcionais, sem regressão de comportamento.
4. WHEN uma requisição chega ao domínio genérico para a URL `/loja/:lojaSlug` e a loja identificada por `lojaSlug` possui o campo `dominio` preenchido na tabela `lojas`, THE **Falcon** SHALL emitir um redirecionamento client-side (React Router `<Navigate replace />` com status equivalente a 301 para fins de SEO quando possível) para `https://{dominio}/`, preservando o caminho relativo quando aplicável.
5. THE **Tenant_Resolver** SHALL ler o valor de `VITE_PLATFORM_DOMAIN` em tempo de build, de modo que a mudança do domínio genérico da plataforma exija apenas a atualização da variável de ambiente e um novo build, sem alteração no código-fonte.

---

### Requisito 7: Página de Erro — Domínio Não Configurado

**User Story:** Como visitante que acessa um domínio não reconhecido pela plataforma, quero ver uma página de erro informativa, para que eu entenda o que aconteceu e possa tomar uma ação.

#### Critérios de Aceitação

1. WHEN o **TenantContext** expõe `{ resolved: false, cause: 'domain_not_found' }`, THE **Falcon** SHALL renderizar o componente `DomainNotFound` exibindo uma mensagem que comunique ao visitante que o domínio acessado não está registrado na plataforma Falcon, sem expor detalhes técnicos como nome de tabela ou código de erro.
2. WHEN o **TenantContext** expõe `{ resolved: false, cause: 'lookup_error' }`, THE **Falcon** SHALL renderizar o componente `DomainLookupError` exibindo uma mensagem de falha técnica genérica e um botão "Tentar novamente" que, ao ser clicado, descarte o cache de resolução e reinicie a query ao Supabase.
3. WHEN qualquer um dos componentes de erro (`DomainNotFound` ou `DomainLookupError`) está renderizado, THE **Falcon** SHALL garantir que nenhuma rota do domínio (incluindo `/admin/login` e `/admin/*`) seja acessível, respondendo com a mesma página de erro para qualquer path tentado.
4. THE **DomainNotFound** component SHALL exibir uma referência à plataforma Falcon (nome e/ou logo) e um link clicável para o site principal da plataforma (valor configurável via variável de ambiente `VITE_PLATFORM_URL`), permitindo que o visitante entenda o contexto e busque informação adicional.

---

### Requisito 8: Infraestrutura de DNS e SSL (Fora do Escopo de Código)

**User Story:** Como operador da plataforma, quero que os requisitos de infraestrutura necessários para o funcionamento do domain-based routing estejam documentados, para que as equipes de infraestrutura e de suporte ao cliente possam planejar as etapas necessárias.

#### Critérios de Aceitação

1. THE **Falcon** documentation SHALL especificar que cada domínio personalizado de loja deve ter um registro DNS do tipo `CNAME` ou `A` apontando para o servidor/CDN da plataforma (Netlify, Vercel ou equivalente).
2. THE **Falcon** documentation SHALL especificar que certificados SSL por domínio devem ser provisionados via Let's Encrypt ou pelo serviço de hospedagem, com renovação automática.
3. THE **Falcon** documentation SHALL especificar que a plataforma de hospedagem deve ser configurada para aceitar domínios personalizados (wildcard ou por entrada individual) e servi-los a partir do mesmo bundle SPA.
4. THE **Falcon** documentation SHALL especificar o processo de onboarding de um novo domínio personalizado: (a) lojista configura DNS, (b) operador preenche campo `dominio` na tabela `lojas`, (c) plataforma de hospedagem adiciona o domínio, (d) SSL é provisionado.
