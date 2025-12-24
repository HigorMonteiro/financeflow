#!/bin/bash

# Script helper para deploy com Docker Compose
# Uso: ./scripts/docker-deploy.sh [comando]

set -e

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    cat << EOF
Uso: $0 [comando]

Comandos disponíveis:
  start       - Iniciar todos os serviços
  stop        - Parar todos os serviços
  restart     - Reiniciar todos os serviços
  build       - Build e iniciar serviços
  logs        - Ver logs de todos os serviços
  logs-api    - Ver logs apenas da API
  logs-nginx  - Ver logs apenas do Nginx
  logs-db     - Ver logs apenas do PostgreSQL
  status      - Ver status dos containers
  migrate     - Aplicar migrações do Prisma
  shell-api   - Abrir shell no container da API
  shell-db    - Abrir shell no PostgreSQL
  health      - Verificar health checks
  backup      - Criar backup do banco de dados
  clean       - Parar e remover containers e volumes (⚠️ apaga dados)
  help        - Mostrar esta ajuda

Exemplos:
  $0 start
  $0 build
  $0 logs-api
  $0 migrate
EOF
}

# Verificar se docker-compose.yml existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Erro: $COMPOSE_FILE não encontrado${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Aviso: $ENV_FILE não encontrado${NC}"
    echo "Copiando .env.example para .env..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Por favor, edite o arquivo .env antes de continuar${NC}"
        exit 1
    else
        echo -e "${RED}Erro: .env.example também não encontrado${NC}"
        exit 1
    fi
fi

# Comando padrão
COMMAND=${1:-help}

case "$COMMAND" in
    start)
        echo -e "${GREEN}Iniciando serviços...${NC}"
        docker compose -f "$COMPOSE_FILE" up -d
        echo -e "${GREEN}✅ Serviços iniciados${NC}"
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    stop)
        echo -e "${YELLOW}Parando serviços...${NC}"
        docker compose -f "$COMPOSE_FILE" down
        echo -e "${GREEN}✅ Serviços parados${NC}"
        ;;
    
    restart)
        echo -e "${YELLOW}Reiniciando serviços...${NC}"
        docker compose -f "$COMPOSE_FILE" restart
        echo -e "${GREEN}✅ Serviços reiniciados${NC}"
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    build)
        echo -e "${GREEN}Build e iniciando serviços...${NC}"
        docker compose -f "$COMPOSE_FILE" up -d --build
        echo -e "${GREEN}✅ Build concluído${NC}"
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    logs)
        docker compose -f "$COMPOSE_FILE" logs -f
        ;;
    
    logs-api)
        docker compose -f "$COMPOSE_FILE" logs -f api
        ;;
    
    logs-nginx)
        docker compose -f "$COMPOSE_FILE" logs -f nginx
        ;;
    
    logs-db)
        docker compose -f "$COMPOSE_FILE" logs -f postgres
        ;;
    
    status)
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    migrate)
        echo -e "${GREEN}Aplicando migrações do Prisma...${NC}"
        docker compose -f "$COMPOSE_FILE" exec api pnpm prisma migrate deploy
        echo -e "${GREEN}✅ Migrações aplicadas${NC}"
        ;;
    
    shell-api)
        docker compose -f "$COMPOSE_FILE" exec api sh
        ;;
    
    shell-db)
        docker compose -f "$COMPOSE_FILE" exec postgres psql -U financeflow -d financeflow
        ;;
    
    health)
        echo -e "${GREEN}Verificando health checks...${NC}"
        echo ""
        echo "Status dos containers:"
        docker compose -f "$COMPOSE_FILE" ps
        echo ""
        echo "Health check da API:"
        curl -s http://localhost/health || echo -e "${RED}❌ API não responde${NC}"
        echo ""
        ;;
    
    backup)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        echo -e "${GREEN}Criando backup do banco de dados...${NC}"
        docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U financeflow financeflow > "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
        ;;
    
    clean)
        echo -e "${RED}⚠️  ATENÇÃO: Isso vai remover todos os containers e volumes!${NC}"
        read -p "Tem certeza? (digite 'yes' para confirmar): " confirm
        if [ "$confirm" = "yes" ]; then
            docker compose -f "$COMPOSE_FILE" down -v
            echo -e "${GREEN}✅ Limpeza concluída${NC}"
        else
            echo "Operação cancelada"
        fi
        ;;
    
    help|*)
        show_help
        ;;
esac

