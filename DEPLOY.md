# Guia de Deploy com Docker

Este guia explica como fazer o deploy da aplicação FinanceFlow usando Docker e Docker Compose.

## Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- pnpm (para desenvolvimento local)

## Estrutura de Arquivos Docker

```
.
├── docker-compose.yml          # Configuração para produção
├── docker-compose.dev.yml      # Configuração para desenvolvimento
├── .env.example                # Exemplo de variáveis de ambiente
├── apps/
│   ├── api/
│   │   ├── Dockerfile         # Build de produção da API
│   │   ├── Dockerfile.dev     # Build de desenvolvimento da API
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile         # Build de produção do Frontend
│       ├── Dockerfile.dev     # Build de desenvolvimento do Frontend
│       ├── nginx.conf         # Configuração do Nginx para produção
│       └── .dockerignore
```

## Desenvolvimento Local

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as variáveis necessárias, especialmente:
- `JWT_SECRET`: Use uma chave segura com pelo menos 32 caracteres
- `DATABASE_URL`: Para desenvolvimento, pode usar SQLite

### 2. Iniciar serviços em modo desenvolvimento

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Isso irá:
- Construir as imagens de desenvolvimento
- Iniciar a API na porta 3000
- Iniciar o Frontend na porta 5173
- Montar volumes para hot-reload

### 3. Executar migrações do banco de dados

```bash
# Entrar no container da API
docker exec -it finance-flow-api-dev sh

# Executar migrações
pnpm prisma migrate deploy

# (Opcional) Criar usuário inicial
pnpm create-user:higor
```

### 4. Acessar a aplicação

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Health Check: http://localhost:3000/health

## Produção

### 1. Preparar variáveis de ambiente

```bash
cp .env.example .env
```

Configure todas as variáveis de ambiente, especialmente:
- `NODE_ENV=production`
- `JWT_SECRET`: Use uma chave segura e única
- `DATABASE_URL`: Configure a URL do banco de dados de produção
- `FRONTEND_URL`: URL do frontend em produção
- `CORS_ORIGIN`: URL permitida para CORS

### 2. Construir e iniciar serviços

```bash
# Construir imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Executar migrações

```bash
# Executar migrações no container da API
docker exec -it finance-flow-api pnpm prisma migrate deploy
```

### 4. Verificar saúde dos serviços

```bash
# Verificar status
docker-compose ps

# Verificar health checks
curl http://localhost:3000/health  # API
curl http://localhost/health        # Frontend
```

## Comandos Úteis

### Desenvolvimento

```bash
# Iniciar serviços
docker-compose -f docker-compose.dev.yml up

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Reconstruir após mudanças
docker-compose -f docker-compose.dev.yml up --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Executar comandos no container
docker exec -it finance-flow-api-dev pnpm prisma studio
docker exec -it finance-flow-api-dev pnpm create-user
```

### Produção

```bash
# Iniciar serviços em background
docker-compose up -d

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir e reiniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f api
docker-compose logs -f web

# Executar migrações
docker exec -it finance-flow-api pnpm prisma migrate deploy

# Criar usuário
docker exec -it finance-flow-api pnpm create-user

# Acessar shell do container
docker exec -it finance-flow-api sh
docker exec -it finance-flow-web sh
```

## Estrutura Multi-Stage Build

### API (apps/api/Dockerfile)

1. **base**: Imagem base com Node.js e pnpm
2. **deps**: Instala todas as dependências
3. **builder**: Gera Prisma Client e compila TypeScript
4. **runner**: Imagem final otimizada apenas com dependências de produção

### Web (apps/web/Dockerfile)

1. **base**: Imagem base com Node.js e pnpm
2. **deps**: Instala todas as dependências
3. **builder**: Compila a aplicação React/Vite
4. **runner**: Imagem Nginx servindo arquivos estáticos

## Otimizações de Produção

### API

- Multi-stage build reduz tamanho da imagem final
- Apenas dependências de produção são incluídas
- Execução como usuário não-root (nodejs)
- Health checks configurados
- Logs otimizados para produção

### Frontend

- Build estático servido por Nginx
- Compressão Gzip habilitada
- Cache de assets estáticos (1 ano)
- Headers de segurança configurados
- Proxy reverso para API
- Fallback SPA para roteamento client-side

## Variáveis de Ambiente Importantes

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `NODE_ENV` | Ambiente de execução | `production` | Não |
| `JWT_SECRET` | Chave secreta para JWT | - | **Sim** |
| `DATABASE_URL` | URL do banco de dados | `file:./dev.db` | Não |
| `FRONTEND_URL` | URL do frontend | `http://localhost` | Não |
| `CORS_ORIGIN` | Origem permitida para CORS | `FRONTEND_URL` | Não |
| `API_PORT` | Porta da API | `3000` | Não |
| `WEB_PORT` | Porta do frontend | `80` | Não |

## Troubleshooting

### Problema: Container não inicia

```bash
# Verificar logs
docker-compose logs api
docker-compose logs web

# Verificar se as portas estão disponíveis
netstat -tuln | grep -E ':(3000|80|5173)'
```

### Problema: Erro de conexão com banco de dados

```bash
# Verificar se o volume do banco está montado corretamente
docker-compose exec api ls -la /app/prisma/data

# Verificar permissões
docker-compose exec api ls -la /app/prisma
```

### Problema: Migrações não aplicam

```bash
# Verificar status das migrações
docker-compose exec api pnpm prisma migrate status

# Aplicar migrações manualmente
docker-compose exec api pnpm prisma migrate deploy
```

### Problema: Frontend não conecta com API

```bash
# Verificar se a API está rodando
curl http://localhost:3000/health

# Verificar variável VITE_API_URL no build
docker-compose exec web env | grep VITE_API_URL

# Reconstruir frontend com variável correta
docker-compose up -d --build web
```

## Segurança

### Checklist de Segurança

- [ ] `JWT_SECRET` é uma chave forte e única
- [ ] `NODE_ENV=production` em produção
- [ ] CORS configurado corretamente
- [ ] Banco de dados com credenciais seguras
- [ ] Volumes do banco de dados protegidos
- [ ] Logs não expõem informações sensíveis
- [ ] Health checks configurados
- [ ] Containers rodam como usuário não-root

## Monitoramento

### Health Checks

Os containers incluem health checks configurados:

- **API**: `GET /health` retorna status da aplicação
- **Web**: `GET /health` retorna status do Nginx

### Logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ver logs apenas da API
docker-compose logs -f api

# Ver logs apenas do frontend
docker-compose logs -f web

# Ver últimas 100 linhas
docker-compose logs --tail=100 api
```

## Próximos Passos

- [ ] Configurar SSL/TLS com Let's Encrypt
- [ ] Adicionar PostgreSQL para produção
- [ ] Configurar backup automático do banco
- [ ] Adicionar monitoramento (Prometheus, Grafana)
- [ ] Configurar CI/CD para deploy automático
- [ ] Adicionar rate limiting na API
- [ ] Configurar CDN para assets estáticos

