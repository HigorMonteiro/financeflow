# Finance Flow Web - Frontend

## 🚀 Execução

### Desenvolvimento Local (sem PM2)

```bash
# Instalar dependências
pnpm install

# Rodar em modo desenvolvimento (Vite Dev Server)
pnpm dev

# Ou rodar o servidor Express diretamente (após build)
pnpm build
pnpm start:dev
```

### Produção Local (com PM2)

```bash
# Build da aplicação
pnpm build

# Rodar com PM2
pnpm start:prod
```

### Docker - Desenvolvimento

```bash
# NODE_ENV=development (usa Node.js diretamente)
docker build -f Dockerfile -t finance-flow-web:dev .
docker run -p 80:80 -e NODE_ENV=development finance-flow-web:dev

# Ou com docker-compose
docker compose up
```

### Docker - Produção

```bash
# NODE_ENV=production (usa PM2)
docker build -f Dockerfile -t finance-flow-web:prod .
docker run -p 80:80 -e NODE_ENV=production finance-flow-web:prod

# Ou com docker-compose
NODE_ENV=production docker compose up
```

## 📝 Variáveis de Ambiente

- `NODE_ENV`: Define o modo de execução
  - `production`: Usa PM2 com cluster mode
  - `development` ou não definido: Usa Node.js diretamente
- `PORT`: Porta do servidor (padrão: 80)
- `VITE_API_URL`: URL da API (usado apenas no build)

## 🔧 Scripts Disponíveis

- `pnpm dev`: Inicia Vite Dev Server (porta 5173)
- `pnpm build`: Build de produção
- `pnpm start`: Inicia servidor Express (Node.js direto)
- `pnpm start:dev`: Inicia em modo desenvolvimento (Node.js direto)
- `pnpm start:prod`: Inicia em modo produção (PM2)

## 🐳 Docker

O Dockerfile detecta automaticamente o ambiente através de `NODE_ENV`:

- **Produção** (`NODE_ENV=production`): Usa PM2 com cluster mode
- **Desenvolvimento** (`NODE_ENV=development` ou não definido): Usa Node.js diretamente

O script `entrypoint.sh` faz essa detecção automaticamente.
