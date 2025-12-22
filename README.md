# 💻 FinanceFlow - Sistema Financeiro Pessoal

Sistema web completo para gestão financeira pessoal com dashboards interativos, controle de gastos em tempo real, metas de economia e análises inteligentes.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + React Query + Zustand
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Autenticação**: JWT

## 📦 Estrutura do Projeto

```
finance-flow/
├── apps/
│   ├── web/          # Frontend React
│   │   ├── src/
│   │   │   ├── components/  # Componentes React
│   │   │   ├── pages/       # Páginas da aplicação
│   │   │   ├── services/    # Serviços de API
│   │   │   └── stores/       # Zustand stores
│   │   └── package.json
│   └── api/          # Backend Node.js
│       ├── src/
│       │   ├── controllers/ # Controllers
│       │   ├── services/    # Lógica de negócio
│       │   ├── routes/      # Rotas da API
│       │   └── middlewares/ # Middlewares
│       ├── prisma/          # Schema e migrations
│       └── package.json
├── scripts/          # Scripts de setup
└── docker-compose.yml
```

## 🛠️ Como Começar

### Pré-requisitos

- Node.js 20+ LTS
- pnpm (recomendado) ou npm/yarn

### Setup Rápido

```bash
# Opção 1: Script automático (recomendado)
./scripts/setup.sh

# Opção 2: Manual
pnpm install
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name init
cd ../..
```

### Configuração Manual

1. **Backend** (`apps/api/.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-key-minimo-32-caracteres"
NODE_ENV="development"
PORT=3000
```

2. **Frontend**: Não requer configuração inicial (usa proxy para API)

### Iniciar Desenvolvimento

```bash
# Na raiz do projeto
pnpm dev
```

Isso iniciará:
- **Backend** em `http://localhost:3000`
- **Frontend** em `http://localhost:5173`

### Primeiro Acesso

1. Acesse `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Crie sua conta
4. Você será redirecionado para o Dashboard

## 📝 Comandos Úteis

```bash
# Desenvolvimento (roda frontend e backend)
pnpm dev

# Backend apenas
cd apps/api && pnpm dev

# Frontend apenas
cd apps/web && pnpm dev

# Prisma Studio (interface visual do banco)
cd apps/api && pnpm prisma studio

# Build para produção
pnpm build

# Testes
pnpm test
```

## 📚 Documentação

- **Arquitetura completa**: Veja `arquitetura_sistema_web.md`
- **Setup detalhado**: Veja `SETUP.md`
- **Backend**: Veja `apps/api/README.md`
- **Frontend**: Veja `apps/web/README.md`

## 🎯 Funcionalidades Implementadas

### ✅ Core
- ✅ Autenticação completa (Registro, Login, JWT)
  - ✅ Funcionalidade "Lembrar usuário e senha" no login
- ✅ Dashboard interativo com métricas financeiras
- ✅ Estrutura de rotas protegidas
- ✅ Componentes UI base (shadcn/ui)
- ✅ Integração React Query + Zustand
- ✅ **Configurações do usuário** (perfil, preferências)
  - ✅ Configuração de paginação (3, 5, 10 ou 50 itens por página)
  - ✅ Aplicada automaticamente em todas as listagens

### ✅ Gestão Financeira
- ✅ **CRUD completo de Transações** (criar, editar, deletar, filtrar)
  - ✅ Scroll infinito com paginação configurável
  - ✅ Filtros avançados com visualização de filtros ativos
  - ✅ Filtros removíveis via Toggles
- ✅ **CRUD completo de Contas** (backend completo, integrado no sistema)
  - ✅ Configuração de período de fatura por conta
  - ✅ Suporte a períodos que cruzam meses (ex: dia 10 ao dia 9)
  - ✅ Interface de gerenciamento completa em Configurações
- ✅ **CRUD completo de Categorias** (com categorias padrão e personalizadas)
- ✅ **Importação de CSV/Excel** (com detecção automática de cartão)
- ✅ **Gestão de Cartões de Crédito** (CRUD completo)

### ✅ Analytics e Visualizações
- ✅ **Dashboard** com resumo financeiro e transações recentes
  - ✅ Exibe últimas 5 despesas
  - ✅ Métricas mensais considerando períodos de fatura configurados
- ✅ **Gráficos de Tendências** (diário, semanal, mensal)
- ✅ **Fluxo de Caixa** (visualização de 3, 6, 12 meses)
- ✅ **Análise por Categoria** (gráficos de pizza para receitas/despesas)
- ✅ **Comparação de Períodos** (mensal, trimestral, anual)
- ✅ **Relatórios baseados em período de fatura** (não apenas mês calendário)

### ✅ Metas de Economia
- ✅ **CRUD completo de Metas** (criar, editar, deletar, visualizar)
- ✅ **Tipos de metas**: Fundo de Emergência, Viagem, Compra, Investimento, Outros
- ✅ **Cálculo automático de progresso** (percentual e barra visual)
- ✅ **Filtros e ordenação** (por status, prazo, progresso, data de criação)
- ✅ **Scroll infinito** com paginação configurável
- ✅ **Exibição no Dashboard** com link para página completa

### ✅ Orçamentos
- ✅ **CRUD completo de Orçamentos** (criar, editar, deletar, visualizar)
- ✅ **Orçamentos por categoria** com períodos configuráveis (Semanal, Mensal, Anual)
- ✅ **Cálculo automático de gastos** baseado em transações reais do período
- ✅ **Visualização de progresso** com cores indicativas:
  - Verde: < 80% utilizado (dentro do orçamento)
  - Amarelo: 80-100% utilizado (próximo do limite)
  - Vermelho: > 100% utilizado (excedido)
- ✅ **Filtros avançados** por status e período
- ✅ **Ordenação** por período, progresso, valor ou data de criação
- ✅ **Exibição de valor restante ou excedido**
- ✅ **Validação de duplicatas** (mesma categoria no mesmo período)
- ✅ **Scroll infinito** com paginação configurável

## 🎨 Funcionalidades de UX/UI

### ✅ Melhorias de Interface
- ✅ **Scroll infinito** em todas as listagens principais
- ✅ **Paginação configurável** por usuário (3, 5, 10 ou 50 itens)
- ✅ **Visualização de filtros ativos** com Toggles removíveis
- ✅ **Indicadores visuais** de carregamento e estados vazios
- ✅ **Formatação de moeda** brasileira (R$)
- ✅ **Formatação de datas** em português

### ✅ Configurações Avançadas
- ✅ **Período de fatura por conta**: Configure dias de início e término da fatura
- ✅ **Relatórios inteligentes**: Cálculos baseados no período de fatura, não apenas mês calendário
- ✅ **Suporte a períodos que cruzam meses**: Ex: fatura do dia 10 ao dia 9 do mês seguinte

> 📊 **Para ver o status detalhado de todas as features, consulte:** [`FEATURES_STATUS.md`](./FEATURES_STATUS.md)

