#!/bin/bash

# Script para aplicar migrations do Prisma
# Uso: ./scripts/apply-migrations.sh [nome-da-migration]
# Se não especificar nome, aplica todas as migrations pendentes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

echo ""
echo "🔄 Aplicando migrations do Prisma..."
echo ""

# Ir para o diretório da API
cd apps/api

# Configurar DATABASE_URL
export DATABASE_URL="file:./prisma/dev.db"

# Verificar se o banco existe
if [ ! -f "prisma/dev.db" ]; then
    print_warning "Banco de dados não encontrado. Criando novo banco..."
fi

# Verificar se há migrations
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    print_error "Nenhuma migration encontrada!"
    exit 1
fi

# Remover migrations inválidas (diretórios sem migration.sql)
print_step "Verificando migrations inválidas..."
for migration_dir in prisma/migrations/*/; do
    if [ -d "$migration_dir" ] && [ ! -f "$migration_dir/migration.sql" ]; then
        print_warning "Removendo migration inválida: $(basename "$migration_dir")"
        rm -rf "$migration_dir"
    fi
done

# Se foi passado um nome de migration específico
if [ -n "$1" ]; then
    MIGRATION_NAME="$1"
    print_step "Aplicando migration específica: $MIGRATION_NAME"
    
    # Verificar se a migration existe
    if [ ! -d "prisma/migrations/$MIGRATION_NAME" ]; then
        print_error "Migration '$MIGRATION_NAME' não encontrada!"
        echo ""
        echo "Migrations disponíveis:"
        ls -1 prisma/migrations/ | grep -v "migration_lock.toml" || echo "Nenhuma migration encontrada"
        exit 1
    fi
    
    # Aplicar migration específica
    DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy --name "$MIGRATION_NAME" || {
        print_error "Erro ao aplicar migration '$MIGRATION_NAME'"
        exit 1
    }
    
    print_success "Migration '$MIGRATION_NAME' aplicada com sucesso!"
else
    # Aplicar todas as migrations pendentes
    print_step "Verificando status das migrations..."
    
    # Verificar status
    STATUS=$(DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate status 2>&1 || true)
    
    if echo "$STATUS" | grep -q "Database schema is up to date"; then
        print_success "Todas as migrations já estão aplicadas!"
    elif echo "$STATUS" | grep -q "migrations have not yet been applied"; then
        print_step "Aplicando migrations pendentes..."
        DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy || {
            print_warning "Erro ao aplicar migrations com 'migrate deploy', tentando 'migrate dev'..."
            DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate dev || {
                print_error "Erro ao aplicar migrations"
                exit 1
            }
        }
        print_success "Migrations aplicadas com sucesso!"
    else
        # Tentar aplicar de qualquer forma
        print_step "Aplicando migrations..."
        DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy 2>/dev/null || {
            print_warning "Tentando resetar e aplicar migrations..."
            DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate reset --force --skip-seed 2>/dev/null || true
            DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy || {
                print_error "Erro ao aplicar migrations"
                exit 1
            }
        }
        print_success "Migrations aplicadas com sucesso!"
    fi
fi

# Regenerar Prisma Client após aplicar migrations
print_step "Regenerando Prisma Client..."
DATABASE_URL="file:./prisma/dev.db" pnpm prisma:generate || {
    print_error "Erro ao regenerar Prisma Client"
    exit 1
}

print_success "Prisma Client regenerado!"

echo ""
print_success "Processo concluído! 🎉"
echo ""

