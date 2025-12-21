#!/bin/bash

# Script para aplicar a migration de categorias padrão
# Execute este script na raiz do projeto: ./scripts/apply-migration.sh

set -e

echo "🔄 Aplicando migration para adicionar campo isDefault..."

cd "$(dirname "$0")/.."

# Verificar se o banco existe
if [ ! -f "prisma/dev.db" ]; then
    echo "❌ Banco de dados não encontrado. Execute 'pnpm prisma migrate dev' primeiro."
    exit 1
fi

# Aplicar migration SQL
echo "📝 Aplicando SQL da migration..."
sqlite3 prisma/dev.db < prisma/migrations/20251221040000_add_category_is_default/migration.sql

# Regenerar Prisma Client
echo "🔨 Regenerando Prisma Client..."
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma generate

echo "✅ Migration aplicada com sucesso!"
echo ""
echo "💡 Agora você pode executar o seed novamente:"
echo "   pnpm prisma:seed"

