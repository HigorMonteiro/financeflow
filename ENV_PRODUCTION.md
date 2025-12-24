# Configuração do .env para Produção na VPS

Este documento explica como configurar o arquivo `.env` para produção na VPS.

## 📍 Localização dos Arquivos .env

Existem **dois** arquivos `.env` diferentes:

### 1. `.env` no projeto `vps-automation` (para Ansible)
**Localização:** `/path/to/vps-automation/.env`

Usado pelo Ansible para configurar a infraestrutura (PostgreSQL, Redis, etc.)

### 2. `.env` no projeto `sistema de gastos` (para aplicação)
**Localização:** `/home/deploy/apps/finance_flow/.env` (na VPS)

Usado pelo `docker-compose.yml` para configurar os containers da aplicação.

## 🔧 Configuração do .env na VPS (Aplicação)

### Localização
```
/home/deploy/apps/finance_flow/.env
```

### Permissões
```bash
chmod 600 /home/deploy/apps/finance_flow/.env
chown deploy:deploy /home/deploy/apps/finance_flow/.env
```

### Exemplo Completo

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Opção 1: SQLite (padrão - mais simples)
DATABASE_URL=file:./prisma/dev.db

# Opção 2: PostgreSQL (recomendado para produção)
# DATABASE_URL=postgresql://financeflow:SENHA_FORTE@postgres:5432/financeflow
# POSTGRES_USER=financeflow
# POSTGRES_PASSWORD=SENHA_FORTE_MINIMO_32_CARACTERES
# POSTGRES_DB=financeflow
# POSTGRES_PORT=5432

# ============================================
# BACKEND API CONFIGURATION
# ============================================
JWT_SECRET=GERE_UMA_CHAVE_FORTE_AQUI_MINIMO_32_CARACTERES
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL=https://seu-dominio.com
CORS_ORIGIN=https://seu-dominio.com
CORS_CREDENTIALS=true
VITE_API_URL=https://seu-dominio.com/api

# ============================================
# PORT CONFIGURATION
# ============================================
API_PORT=3000
WEB_PORT=80

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
LOG_ERRORS=true
```

## 🔐 Gerando Credenciais Seguras

### JWT Secret
```bash
# Gere uma chave forte (mínimo 32 caracteres)
openssl rand -base64 32
```

### Senha PostgreSQL
```bash
# Gere uma senha forte
openssl rand -base64 24
```

## 📋 Checklist de Configuração

### Antes do Deploy

- [ ] Gerar `JWT_SECRET` forte (mínimo 32 caracteres)
- [ ] Configurar `FRONTEND_URL` com seu domínio real
- [ ] Configurar `CORS_ORIGIN` com seu domínio real
- [ ] Configurar `VITE_API_URL` (pode ser subdomínio ou `/api`)
- [ ] Decidir entre SQLite ou PostgreSQL
- [ ] Se usar PostgreSQL, gerar senha forte
- [ ] Configurar permissões do arquivo (600)

### Exemplo de Valores Reais

```bash
# Domínio: financeflow.com.br
# API: api.financeflow.com.br ou financeflow.com.br/api

DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=K8j3mN9pQ2rT5vW8xZ1bC4eF7hJ0kL3mN6pQ9sT2vW5yZ8bC1eF4hJ7kL0mN3pQ6
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://financeflow.com.br
CORS_ORIGIN=https://financeflow.com.br
CORS_CREDENTIALS=true
VITE_API_URL=https://financeflow.com.br/api
API_PORT=3000
WEB_PORT=80
LOG_LEVEL=info
LOG_ERRORS=true
```

## 🔄 Usando PostgreSQL

Se quiser usar PostgreSQL em produção:

```bash
# No .env da aplicação
DATABASE_URL=postgresql://financeflow:SENHA_FORTE@postgres:5432/financeflow
POSTGRES_USER=financeflow
POSTGRES_PASSWORD=SENHA_FORTE_MINIMO_32_CARACTERES
POSTGRES_DB=financeflow
POSTGRES_PORT=5432
```

E iniciar o PostgreSQL:
```bash
docker compose --profile postgres up -d
```

## 🚀 Deploy com Ansible

Se usar Ansible, configure também o `.env` no projeto `vps-automation`:

```bash
# No projeto vps-automation/.env
export VPS_HOST=seu.ip.aqui
export VPS_USER=deploy
export POSTGRES_DB_NAME=financeflow
export POSTGRES_DB_USER=financeflow
export POSTGRES_DB_PASSWORD=SENHA_FORTE
export APP_JWT_SECRET=CHAVE_JWT_FORTE
export APP_FRONTEND_URL=https://seu-dominio.com
export APP_CORS_ORIGIN=https://seu-dominio.com
export APP_VITE_API_URL=https://seu-dominio.com/api
```

## ⚠️ Segurança

1. **Nunca commite o `.env` no git**
2. **Use permissões 600** no arquivo `.env`
3. **Gere senhas fortes** (mínimo 32 caracteres)
4. **Use HTTPS** em produção
5. **Mantenha backups** do `.env` em local seguro

## 📝 Notas

- O arquivo `.env` é lido pelo `docker-compose.yml`
- Variáveis podem ter valores padrão (usando `${VAR:-default}`)
- O Ansible pode gerar o `.env` automaticamente se configurado
- Para mudanças, edite o `.env` e reinicie os containers: `docker compose restart`

