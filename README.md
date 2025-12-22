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
- ✅ Dashboard interativo com métricas financeiras
- ✅ Estrutura de rotas protegidas
- ✅ Componentes UI base (shadcn/ui)
- ✅ Integração React Query + Zustand

### ✅ Gestão Financeira
- ✅ **CRUD completo de Transações** (criar, editar, deletar, filtrar)
- ✅ **CRUD completo de Contas** (backend completo, integrado no sistema)
- ✅ **CRUD completo de Categorias** (com categorias padrão e personalizadas)
- ✅ **Importação de CSV/Excel** (com detecção automática de cartão)
- ✅ **Gestão de Cartões de Crédito** (CRUD completo)

### ✅ Analytics e Visualizações
- ✅ **Dashboard** com resumo financeiro e transações recentes
- ✅ **Gráficos de Tendências** (diário, semanal, mensal)
- ✅ **Fluxo de Caixa** (visualização de 3, 6, 12 meses)
- ✅ **Análise por Categoria** (gráficos de pizza para receitas/despesas)
- ✅ **Comparação de Períodos** (mensal, trimestral, anual)

### ⚠️ Em Desenvolvimento
- ⚠️ **Metas de Economia** (modelo existe, falta CRUD completo)
  - ✅ Exibição no Dashboard
  - ❌ Página de gerenciamento ainda não implementada

### ❌ Planejadas
- ❌ **Orçamentos** (modelo no schema, aguardando implementação)

> 📊 **Para ver o status detalhado de todas as features, consulte:** [`FEATURES_STATUS.md`](./FEATURES_STATUS.md)

