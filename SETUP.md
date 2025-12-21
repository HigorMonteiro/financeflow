# 🚀 Guia de Setup - FinanceFlow

## Pré-requisitos

- Node.js 20+ LTS
- pnpm (recomendado) ou npm/yarn
- Git

## Instalação

### 1. Instalar dependências

```bash
# Na raiz do projeto
pnpm install
```

### 2. Configurar Backend

```bash
cd apps/api

# Copiar arquivo de ambiente (se não existir)
# Criar arquivo .env com:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="seu-secret-key-super-seguro-aqui-minimo-32-caracteres"
# NODE_ENV="development"
# PORT=3000

# Gerar cliente Prisma
pnpm prisma generate

# Rodar migrations
pnpm prisma migrate dev --name init
```

### 3. Configurar Frontend

```bash
cd apps/web

# O frontend já está configurado, não precisa de .env para desenvolvimento local
# Mas se quiser customizar, crie .env.local com:
# VITE_API_URL=http://localhost:3000
```

### 4. Iniciar Desenvolvimento

```bash
# Na raiz do projeto
pnpm dev
```

Isso iniciará:
- Backend em `http://localhost:3000`
- Frontend em `http://localhost:5173`

## Estrutura do Banco de Dados

O banco SQLite será criado automaticamente em `apps/api/dev.db` após rodar as migrations.

## Comandos Úteis

### Backend

```bash
cd apps/api

# Rodar migrations
pnpm prisma migrate dev

# Abrir Prisma Studio (interface visual do banco)
pnpm prisma studio

# Rodar testes
pnpm test

# Build para produção
pnpm build
```

### Frontend

```bash
cd apps/web

# Build para produção
pnpm build

# Preview do build
pnpm preview
```

## Primeiro Acesso

1. Acesse `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Crie sua conta
4. Você será redirecionado para o Dashboard

## Troubleshooting

### Erro de conexão com banco

Certifique-se de que rodou `pnpm prisma migrate dev` no diretório `apps/api`.

### Erro de CORS

Verifique se o backend está rodando na porta 3000 e o frontend na 5173.

### Erro de token JWT

Certifique-se de que o `JWT_SECRET` no `.env` do backend tem pelo menos 32 caracteres.

