# Deploy com Docker Compose

Este documento descreve como fazer deploy completo da aplicação usando Docker Compose, incluindo PostgreSQL, Nginx, Backend e Frontend.

## Arquitetura

```
┌─────────────┐
│   Nginx     │ (Porta 80/443) - Reverse Proxy
└──────┬──────┘
       │
       ├───► /api ────► Backend API (Porta 3000)
       │
       └───► / ───────► Frontend Web (Porta 80 interno)
       
Backend API ────► PostgreSQL (Porta 5432 interno)
```

## Pré-requisitos

- Docker e Docker Compose instalados
- Git configurado
- Arquivo `.env` configurado (veja `.env.example`)

## Estrutura de Arquivos

```
.
├── docker-compose.yml          # Configuração principal
├── .env                        # Variáveis de ambiente (criar a partir de .env.example)
├── nginx/
│   ├── nginx.conf              # Configuração principal do Nginx
│   └── conf.d/
│       └── default.conf         # Configuração do servidor
└── apps/
    ├── api/                     # Backend
    └── web/                      # Frontend
```

## Configuração Inicial

### 1. Criar arquivo .env

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

- `POSTGRES_PASSWORD`: Senha forte para o banco de dados
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `FRONTEND_URL`: URL do frontend (ex: `http://localhost` ou `https://seu-dominio.com`)
- `CORS_ORIGIN`: Origem permitida para CORS
- `VITE_API_URL`: URL da API para o frontend (ex: `http://localhost/api`)

### 2. Gerar JWT Secret

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

# Apenas Nginx
docker compose logs -f nginx

# Apenas PostgreSQL
docker compose logs -f postgres
```

### 5. Verificar health checks

```bash
# API
curl http://localhost/health

# Frontend
curl http://localhost/
```

## Comandos Úteis

### Parar todos os serviços

```bash
docker compose down
```

### Parar e remover volumes (⚠️ apaga dados do banco)

```bash
docker compose down -v
```

### Reiniciar um serviço específico

```bash
docker compose restart api
docker compose restart nginx
```

### Rebuild de um serviço específico

```bash
docker compose up -d --build api
```

### Acessar shell do container

```bash
# API
docker compose exec api sh

# PostgreSQL
docker compose exec postgres psql -U financeflow -d financeflow

# Nginx
docker compose exec nginx sh
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

## Configuração do Nginx

O Nginx está configurado para:

- **Porta 80**: HTTP (pode ser redirecionado para HTTPS)
- **Porta 443**: HTTPS (descomente no `nginx/conf.d/default.conf` quando tiver certificados SSL)

### Rotas:

- `/api/*` → Backend API (porta 3000)
- `/health` → Health check da API
- `/*` → Frontend (SPA)

### Rate Limiting:

- API: 10 requisições/segundo (burst: 20)
- Geral: 30 requisições/segundo (burst: 50)

## SSL/TLS (Opcional)

Para habilitar HTTPS:

1. Obtenha certificados SSL (Let's Encrypt recomendado)
2. Coloque os certificados em `nginx/ssl/`:
   - `fullchain.pem`
   - `privkey.pem`
3. Descomente o bloco HTTPS no `nginx/conf.d/default.conf`
4. Reinicie o Nginx: `docker compose restart nginx`

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs [nome-do-container]

# Verificar configuração
docker compose config
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Verificar logs do PostgreSQL
docker compose logs postgres

# Testar conexão
docker compose exec postgres psql -U financeflow -d financeflow
```

### Erro de migração Prisma

```bash
# Executar migrações manualmente
docker compose exec api pnpm prisma migrate deploy

# Ver status das migrações
docker compose exec api pnpm prisma migrate status
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar se backend está rodando
docker compose ps api

# Verificar logs do Nginx
docker compose logs nginx

# Verificar conectividade entre containers
docker compose exec nginx ping api
```

### Porta já em uso

```bash
# Verificar qual processo está usando a porta
sudo lsof -i :80
sudo lsof -i :443

# Alterar porta no docker-compose.yml ou .env
NGINX_HTTP_PORT=8080
```

## Backup do Banco de Dados

```bash
# Criar backup
docker compose exec postgres pg_dump -U financeflow financeflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T postgres psql -U financeflow financeflow < backup.sql
```

## Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

- **PostgreSQL**: `pg_isready`
- **API**: `GET /health`
- **Nginx**: `GET /health`
- **Frontend**: Health check via Nginx

### Verificar saúde dos serviços

```bash
# Status dos health checks
docker compose ps

# Health check manual
curl http://localhost/health
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
- ✅ Volumes persistentes para dados do banco
- ✅ Rate limiting no Nginx
- ✅ Security headers configurados
- ✅ CORS configurado adequadamente
- ⚠️ Configure SSL/TLS em produção
- ⚠️ Use senhas fortes no `.env`
- ⚠️ Mantenha `.env` seguro (não commite no git)

## Próximos Passos

1. Configure SSL/TLS com Let's Encrypt
2. Configure backup automático do banco de dados
3. Configure monitoramento (Prometheus, Grafana, etc.)
4. Configure logs centralizados (ELK, Loki, etc.)
5. Configure CI/CD para deploy automático

