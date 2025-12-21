# 🔧 Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente disponíveis para customizar o sistema.

## 📋 Backend (`apps/api/.env`)

### 🔐 Obrigatórias

```env
# Chave secreta para JWT (mínimo 32 caracteres)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-minimo-32-caracteres"
```

### ⚙️ Opcionais (com valores padrão)

#### Database
```env
# URL do banco de dados SQLite
DATABASE_URL="file:./dev.db"
```

#### Authentication
```env
# Tempo de expiração do token JWT
JWT_EXPIRES_IN="7d"  # Exemplos: "1h", "24h", "7d", "30d"
```

#### Server
```env
# Ambiente de execução
NODE_ENV="development"  # development | production | test

# Porta do servidor
PORT=3000

# URL do frontend (para CORS)
FRONTEND_URL="http://localhost:5173"
```

#### File Upload
```env
# Tamanho máximo do arquivo em bytes (padrão: 10MB)
MAX_FILE_SIZE=10485760

# Tipos de arquivo permitidos (separados por vírgula)
ALLOWED_FILE_TYPES=".csv,.xlsx,.xls"
```

#### CORS
```env
# Origem permitida para CORS (sobrescreve FRONTEND_URL se definido)
CORS_ORIGIN="http://localhost:5173"

# Permitir credenciais nas requisições CORS
CORS_CREDENTIALS=true
```

#### Logging
```env
# Nível de log
LOG_LEVEL="info"  # error | warn | info | debug

# Logar erros no console
LOG_ERRORS=true
```

#### Seed (Criação de Usuário Padrão)
```env
# Email do usuário padrão (usado no comando pnpm prisma:seed)
SEED_EMAIL="admin@financeflow.com"

# Senha do usuário padrão
SEED_PASSWORD="admin123"

# Nome do usuário padrão
SEED_NAME="Admin User"
```

#### Rate Limiting (Futuro)
```env
# Janela de tempo para rate limiting em milissegundos
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos

# Número máximo de requisições por janela
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎨 Frontend (`apps/web/.env`)

### ⚙️ Opcionais (com valores padrão)

```env
# URL da API backend
VITE_API_URL=http://localhost:3000

# Nome da aplicação
VITE_APP_NAME=FinanceFlow

# Versão da aplicação
VITE_APP_VERSION=1.0.0

# Habilitar analytics (futuro)
VITE_ENABLE_ANALYTICS=false

# Habilitar exportação de dados
VITE_ENABLE_EXPORT=true
```

## 🚀 Como Usar

### 1. Criar arquivo `.env`

**Backend:**
```bash
cd apps/api
cp .env.example .env
```

**Frontend:**
```bash
cd apps/web
cp .env.example .env
```

### 2. Editar variáveis

Abra o arquivo `.env` e customize conforme necessário:

```env
# Exemplo para produção
NODE_ENV=production
PORT=3000
JWT_SECRET="sua-chave-super-segura-de-producao-minimo-32-caracteres"
FRONTEND_URL="https://seu-dominio.com"
```

### 3. Reiniciar servidor

Após alterar variáveis de ambiente, reinicie o servidor:

```bash
# Backend
cd apps/api
pnpm dev

# Frontend
cd apps/web
pnpm dev
```

## 🔒 Segurança

### ⚠️ NUNCA commite arquivos `.env`

Os arquivos `.env` estão no `.gitignore` e **NÃO devem** ser commitados no Git.

### ✅ Boas Práticas

1. **JWT_SECRET**: Use uma chave aleatória forte (mínimo 32 caracteres)
   ```bash
   # Gerar chave aleatória
   openssl rand -base64 32
   ```

2. **Produção**: Use variáveis de ambiente do sistema ou serviços como:
   - Railway
   - Render
   - Vercel
   - Heroku
   - AWS Secrets Manager

3. **Desenvolvimento**: Use `.env.example` como template

## 📝 Exemplos de Configuração

### Desenvolvimento Local

```env
# apps/api/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key-change-in-production-minimum-32-chars"
NODE_ENV=development
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Produção

```env
# apps/api/.env
DATABASE_URL="file:/app/data/production.db"
JWT_SECRET="[chave-aleatoria-gerada-com-openssl-rand-base64-32]"
NODE_ENV=production
PORT=3000
FRONTEND_URL="https://financeflow.com"
MAX_FILE_SIZE=52428800  # 50MB
LOG_LEVEL=warn
```

### Testes

```env
# apps/api/.env.test
DATABASE_URL="file:./test.db"
JWT_SECRET="test-secret-key-for-testing-only"
NODE_ENV=test
PORT=3001
```

## 🔍 Verificar Variáveis

Para verificar se as variáveis estão sendo carregadas:

```bash
# Backend
cd apps/api
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
```

## 🐛 Troubleshooting

### Variável não está sendo lida

1. Verifique se o arquivo `.env` está no diretório correto
2. Verifique se não há espaços extras: `VAR=value` (não `VAR = value`)
3. Reinicie o servidor após alterar `.env`
4. Verifique se não há aspas desnecessárias (exceto para valores com espaços)

### Erro de validação

Se você receber erro sobre variáveis obrigatórias:
- Verifique se `JWT_SECRET` tem pelo menos 32 caracteres
- Verifique se URLs estão no formato correto (com `http://` ou `https://`)

## 📚 Referências

- [dotenv](https://github.com/motdotla/dotenv) - Biblioteca usada para carregar `.env`
- [Zod](https://zod.dev/) - Validação de variáveis de ambiente

