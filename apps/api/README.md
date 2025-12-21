# FinanceFlow API

Backend API do sistema financeiro pessoal.

## Tecnologias

- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- SQLite
- JWT Authentication
- Zod Validation

## Estrutura

```
src/
├── config/          # Configurações (database, env)
├── controllers/     # Controllers das rotas
├── middlewares/     # Middlewares (auth, error, validation)
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── types/           # TypeScript types
├── validators/      # Schemas de validação Zod
└── server.ts        # Entry point
```

## Setup

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Gerar cliente Prisma
pnpm prisma generate

# Rodar migrations
pnpm prisma migrate dev

# Iniciar desenvolvimento
pnpm dev
```

## 👤 Criar Usuário

Existem várias formas de criar um usuário. Veja o arquivo `CREATE_USER.md` para detalhes completos.

**Forma mais fácil (via Frontend):**
1. Inicie o servidor: `pnpm dev`
2. Acesse `http://localhost:5173/register`
3. Preencha o formulário e crie sua conta

**Via CLI:**
```bash
pnpm create-user seu@email.com suasenha123 "Seu Nome"
```

**Via Seed (usuário padrão):**
```bash
pnpm prisma:seed
```

## Endpoints

### Autenticação

- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário (requer autenticação)

## Variáveis de Ambiente

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-key-minimo-32-caracteres"
NODE_ENV="development"
PORT=3000
```

