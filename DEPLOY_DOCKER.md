# Deploy com Docker Compose

Este documento descreve como fazer deploy completo da aplicação usando Docker Compose, incluindo Backend API (com SQLite) e Frontend Web.

## Arquitetura

```
┌─────────────┐
│   Frontend   │ (Porta 80) - Nginx interno
│     Web      │
└──────┬───────┘
       │
       ├───► /api ────► Backend API (Porta 3000)
       │
       └───► / ───────► Frontend SPA
       
Backend API ────► Database (SQLite por padrão ou PostgreSQL se configurado)
```

**Banco de Dados:**
- **Padrão**: SQLite (`file:./prisma/dev.db`) - não requer configuração adicional
- **Opcional**: PostgreSQL - configure `DATABASE_URL` no `.env` para usar

## Pré-requisitos

- Docker e Docker Compose instalados
- Git configurado
- Arquivo `.env` configurado (veja `.env.example`)

## Estrutura de Arquivos

```
.
├── docker-compose.yml          # Configuração principal
├── .env                        # Variáveis de ambiente (criar a partir de .env.example)
└── apps/
    ├── api/                     # Backend (SQLite)
    └── web/                      # Frontend (Nginx interno)
```

## Configuração Inicial

### 1. Criar arquivo .env

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

- `DATABASE_URL`: URL do banco de dados (opcional)
  - **Padrão (SQLite)**: `file:./prisma/dev.db` - não precisa configurar
  - **PostgreSQL**: `postgresql://financeflow:password@postgres:5432/financeflow`
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `FRONTEND_URL`: URL do frontend (ex: `http://localhost` ou `https://seu-dominio.com`)
- `CORS_ORIGIN`: Origem permitida para CORS
- `VITE_API_URL`: URL da API para o frontend (ex: `http://localhost:3000`)

### 2.1. Usar PostgreSQL (Opcional)

Se quiser usar PostgreSQL ao invés de SQLite:

1. Configure `DATABASE_URL` no `.env`:
```bash
DATABASE_URL=postgresql://financeflow:password@postgres:5432/financeflow
```

2. Configure variáveis do PostgreSQL:
```bash
POSTGRES_USER=financeflow
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=financeflow
POSTGRES_PORT=5432
```

3. Inicie o PostgreSQL junto com os outros serviços:
```bash
docker compose --profile postgres up -d
```

Ou adicione `postgres` ao profile padrão removendo a linha `profiles:` do serviço postgres no docker-compose.yml.

### 3. Gerar JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Ou use um gerador online
```

## Deploy Local

### 1. Build e iniciar todos os serviços

```bash
docker compose up -d --build
```

### 2. Verificar status dos containers

```bash
docker compose ps
```

### 3. Aplicar migrações do banco de dados

```bash
docker compose exec api pnpm prisma migrate deploy
```

### 4. Verificar logs

```bash
# Todos os serviços
docker compose logs -f

# Apenas API
docker compose logs -f api

# Apenas Frontend
docker compose logs -f web
```

### 5. Verificar health checks

```bash
# API
curl http://localhost:3000/health

# Frontend
curl http://localhost/health
```

## Comandos Úteis

### Parar todos os serviços

```bash
docker compose down
```

### Parar e remover volumes (⚠️ apaga dados do banco SQLite)

```bash
docker compose down -v
```

### Reiniciar um serviço específico

```bash
docker compose restart api
docker compose restart web
```

### Rebuild de um serviço específico

```bash
docker compose up -d --build api
```

### Acessar shell do container

```bash
# API
docker compose exec api sh

# Frontend
docker compose exec web sh
```

### Ver logs em tempo real

```bash
docker compose logs -f --tail=100
```

## Deploy em Produção com Ansible

### 1. Deploy Completo (primeira vez)

```bash
cd /path/to/vps-automation
ansible-playbook -i inventory.yml deploy-app.yml
```

### 2. Deploy Simplificado (apenas git pull + restart)

```bash
cd /path/to/vps-automation
ansible-playbook -i inventory.yml deploy-simple.yml
```

O playbook simplificado faz:
- ✅ Git pull da branch especificada
- ✅ Rebuild dos containers (se necessário)
- ✅ Restart dos containers
- ✅ Aplicação de migrações do Prisma
- ✅ Verificação de health checks

## Variáveis do Ansible

Configure no `inventory.yml`:

```yaml
app_dir: /home/deploy/apps/finance_flow
app_user: deploy
git_repo: https://github.com/seu-usuario/seu-repositorio
git_branch: main
docker_compose_file: docker-compose.yml
```

## Configuração do Frontend

O Frontend tem Nginx interno configurado para:

- **Porta 80**: Servir arquivos estáticos do SPA
- **`/api/*`**: Proxy reverso para Backend API (porta 3000)
- **`/health`**: Health check do frontend
- **`/*`**: Fallback para `index.html` (SPA routing)

### Rotas:

- `/api/*` → Backend API (porta 3000)
- `/health` → Health check
- `/*` → Frontend (SPA)

## Banco de Dados

### SQLite (Padrão)

Se `DATABASE_URL` não for definido ou começar com `file:`, o sistema usa SQLite:

- **Volume**: `api-db-data`
- **Localização no container**: `/app/prisma/dev.db`
- **Persistência**: Os dados são mantidos mesmo após `docker compose down` (mas são removidos com `docker compose down -v`)
- **Vantagens**: Simples, não requer configuração adicional, rápido para desenvolvimento

### PostgreSQL (Opcional)

Para usar PostgreSQL, defina `DATABASE_URL` no formato:
```
postgresql://usuario:senha@postgres:5432/nome_do_banco
```

- **Volume**: `postgres-data`
- **Persistência**: Dados mantidos em volume Docker
- **Vantagens**: Melhor para produção, suporta múltiplas conexões simultâneas

**Para iniciar com PostgreSQL:**
```bash
docker compose --profile postgres up -d
```

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs [nome-do-container]

# Verificar configuração
docker compose config
```

### Erro de conexão com banco SQLite

```bash
# Verificar se API está rodando
docker compose ps api

# Verificar logs do SQLite
docker compose logs api

# Verificar permissões do volume
docker compose exec api ls -la /app/prisma
```

### Erro de migração Prisma

```bash
# Executar migrações manualmente
docker compose exec api pnpm prisma migrate deploy

# Ver status das migrações
docker compose exec api pnpm prisma migrate status
```

### Frontend não consegue acessar API

```bash
# Verificar se API está rodando
docker compose ps api

# Verificar logs do Frontend
docker compose logs web

# Testar conectividade entre containers
docker compose exec web ping api
```

### Porta já em uso

```bash
# Verificar qual processo está usando a porta
sudo lsof -i :80
sudo lsof -i :3000

# Alterar porta no docker-compose.yml ou .env
API_PORT=3001
WEB_PORT=8080
```

## Backup do Banco de Dados

```bash
# Criar backup do SQLite
docker compose exec api cp /app/prisma/dev.db /app/prisma/backup_$(date +%Y%m%d_%H%M%S).db

# Ou copiar para o host
docker compose cp api:/app/prisma/dev.db ./backup_$(date +%Y%m%d_%H%M%S).db

# Restaurar backup
docker compose cp ./backup.db api:/app/prisma/dev.db
docker compose restart api
```

## Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

- **API**: `GET http://localhost:3000/health`
- **Frontend**: `GET http://localhost/health`

### Verificar saúde dos serviços

```bash
# Status dos health checks
docker compose ps

# Health check manual
curl http://localhost:3000/health  # API
curl http://localhost/health        # Frontend
```

## Atualização

### Atualizar código e reiniciar

```bash
# Local
git pull
docker compose up -d --build

# Com Ansible (recomendado em produção)
ansible-playbook -i inventory.yml deploy-simple.yml
```

## Segurança

- ✅ Containers rodam com usuários não-root quando possível
- ✅ Volume persistente para dados do banco SQLite
- ✅ Security headers configurados no Nginx do frontend
- ✅ CORS configurado adequadamente
- ⚠️ Use senhas fortes no `.env`
- ⚠️ Mantenha `.env` seguro (não commite no git)
- ⚠️ Configure SSL/TLS em produção (use um proxy reverso externo se necessário)

## Próximos Passos

1. Configure backup automático do banco SQLite
2. Configure monitoramento (Prometheus, Grafana, etc.)
3. Configure logs centralizados (ELK, Loki, etc.)
4. Configure CI/CD para deploy automático
5. Configure SSL/TLS com um proxy reverso externo (se necessário)
