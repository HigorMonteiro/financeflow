#!/bin/bash

set -e

echo "🚀 FinanceFlow - Setup Inicial"
echo "================================"
echo ""

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não está instalado. Instalando..."
    npm install -g pnpm
fi

echo "📦 Instalando dependências..."
pnpm install

echo ""
echo "🔧 Configurando Backend..."

# Criar .env se não existir
if [ ! -f apps/api/.env ]; then
    echo "📝 Criando arquivo .env..."
    cat > apps/api/.env << EOF
DATABASE_URL="file:./dev.db"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV="development"
PORT=3000
EOF
    echo "✅ Arquivo .env criado!"
else
    echo "ℹ️  Arquivo .env já existe"
fi

echo ""
echo "🗄️  Gerando cliente Prisma..."
cd apps/api
pnpm exec prisma generate || ./node_modules/.bin/prisma generate || npx --yes prisma@5.7.1 generate

echo ""
echo "📊 Rodando migrations..."
pnpm exec prisma migrate dev --name init || ./node_modules/.bin/prisma migrate dev --name init || npx --yes prisma@5.7.1 migrate dev --name init || echo "⚠️  Migrations podem já estar aplicadas"

cd ../..

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o desenvolvimento, execute:"
echo "  pnpm dev"
echo ""
echo "Isso iniciará:"
echo "  - Backend em http://localhost:3000"
echo "  - Frontend em http://localhost:5173"

