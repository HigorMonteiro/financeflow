# Configuração PM2 para Finance Flow API

Este guia explica como configurar e usar o PM2 para gerenciar a API do Finance Flow em produção.

## 📋 Pré-requisitos

- Node.js instalado (versão 20+)
- PM2 instalado globalmente: `npm install -g pm2`
- API compilada (`npm run build`)
- Arquivo `.env` configurado

## 🚀 Configuração Inicial

### 1. Instalar PM2 (se ainda não instalado)

```bash
npm install -g pm2
```

### 2. Compilar a API

```bash
cd apps/api
npm run build
```

### 3. Configurar PM2 para iniciar no boot

```bash
pm2 startup systemd -u deploy --hp /home/deploy
# Execute o comando retornado como root
```

### 4. Iniciar API com PM2

```bash
cd apps/api
pm2 start ecosystem.config.js
pm2 save
```

## 📁 Estrutura de Arquivos

```
/home/deploy/apps/finance_flow/
├── apps/
│   └── api/
│       ├── ecosystem.config.js    # Configuração do PM2
│       ├── .env                   # Variáveis de ambiente
│       ├── dist/                  # Código compilado
│       └── package.json
└── .git
```

## 🔧 Comandos PM2 Úteis

### Gerenciamento Básico

```bash
# Ver status de todos os processos
pm2 list

# Ver informações detalhadas da API
pm2 describe finance-flow-api

# Ver logs em tempo real
pm2 logs finance-flow-api

# Ver apenas erros
pm2 logs finance-flow-api --err

# Ver últimas 100 linhas
pm2 logs finance-flow-api --lines 100
```

### Controle do Processo

```bash
# Reiniciar API
pm2 restart finance-flow-api

# Parar API
pm2 stop finance-flow-api

# Iniciar API
pm2 start finance-flow-api

# Deletar processo do PM2
pm2 delete finance-flow-api

# Recarregar sem downtime (zero-downtime reload)
pm2 reload finance-flow-api
```

### Monitoramento

```bash
# Monitor em tempo real
pm2 monit

# Ver estatísticas
pm2 status

# Ver informações detalhadas
pm2 show finance-flow-api
```

### Logs

```bash
# Ver logs em tempo real
pm2 logs finance-flow-api -f

# Ver logs do arquivo diretamente
tail -f /home/deploy/.pm2/logs/finance-flow-api-combined.log

# Limpar logs
pm2 flush
```

## ⚙️ Configuração do ecosystem.config.js

O arquivo `ecosystem.config.js` está configurado com:

- **Nome**: `finance-flow-api`
- **Script**: `node dist/server.js`
- **Diretório**: `/home/deploy/apps/finance_flow/apps/api`
- **Instâncias**: 1 (single instance)
- **Modo**: `fork`
- **Auto-restart**: Habilitado
- **Limite de memória**: 1GB (restart automático se exceder)
- **Logs**: Centralizados em `/home/deploy/.pm2/logs/`

### Personalizar Configuração

Para alterar configurações, edite `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'finance-flow-api',
    // ... outras configurações
    
    // Aumentar limite de memória
    max_memory_restart: '2G',
    
    // Executar múltiplas instâncias (cluster mode)
    instances: 2,
    exec_mode: 'cluster',
    
    // Habilitar watch mode (desenvolvimento)
    watch: true,
    watch_delay: 1000,
    ignore_watch: ['node_modules', 'dist', 'logs']
  }]
};
```

## 🔄 Workflow de Deploy

### Deploy Manual

```bash
# 1. Conectar na VPS
ssh deploy@seu.ip.aqui

# 2. Ir para diretório da API
cd /home/deploy/apps/finance_flow/apps/api

# 3. Atualizar código
git pull origin main

# 4. Instalar dependências (se necessário)
npm ci

# 5. Compilar
npm run build

# 6. Aplicar migrações (se necessário)
npm run prisma:migrate:deploy

# 7. Reiniciar PM2
pm2 restart finance-flow-api

# 8. Verificar logs
pm2 logs finance-flow-api --lines 50
```

### Deploy Automatizado (via Ansible)

O Ansible já está configurado para fazer deploy automático. Execute:

```bash
cd /Users/higormonteiro/workspace/vps-automation/ansible
ansible-playbook -i inventory/production playbooks/deploy-api.yml
```

## 🐛 Troubleshooting

### API não inicia

```bash
# Ver logs de erro
pm2 logs finance-flow-api --err --lines 100

# Verificar se arquivo compilado existe
ls -la dist/server.js

# Verificar variáveis de ambiente
cat .env

# Testar manualmente
node dist/server.js
```

### PM2 não inicia no boot

```bash
# Verificar se startup está configurado
pm2 startup

# Reconfigurar
pm2 startup systemd -u deploy --hp /home/deploy
# (executar comando retornado como root)

# Verificar serviço systemd
sudo systemctl status pm2-deploy
```

### API para constantemente

```bash
# Ver logs para identificar problema
pm2 logs finance-flow-api --lines 200

# Verificar limite de memória
pm2 describe finance-flow-api | grep memory

# Verificar se há erros no código
npm run build
```

### Porta já em uso

```bash
# Verificar o que está usando a porta 3000
sudo lsof -i :3000

# Parar processo conflitante ou mudar porta no .env
```

## 📊 Monitoramento e Métricas

### Ver Estatísticas

```bash
# Estatísticas em tempo real
pm2 monit

# Informações detalhadas
pm2 describe finance-flow-api
```

### Health Check

A API tem um endpoint de health check:

```bash
# Testar health check
curl http://localhost:3000/health

# Deve retornar:
# {"status":"ok","timestamp":"2024-..."}
```

## 🔒 Segurança

- O arquivo `.env` não deve ser commitado no Git
- Logs podem conter informações sensíveis - proteger acesso
- PM2 roda como usuário `deploy` (não root)
- Limitar acesso ao diretório `/home/deploy/.pm2/`

## 📝 Notas

- O PM2 salva automaticamente a lista de processos com `pm2 save`
- Após reiniciar o servidor, o PM2 inicia automaticamente os processos salvos
- Logs são rotacionados automaticamente pelo PM2
- Para produção, considere usar modo cluster com múltiplas instâncias

