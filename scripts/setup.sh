#!/bin/bash

# Script de configuração completa do sistema financeiro
# Execute na raiz do projeto: ./scripts/setup.sh

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
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
echo "🚀 Configurando sistema financeiro do zero..."
echo ""

# 1. Limpar node_modules
print_step "1/7 Limpando node_modules..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "node_modules removido"
else
    print_warning "node_modules não encontrado, pulando..."
fi

if [ -d "apps/api/node_modules" ]; then
    rm -rf apps/api/node_modules
fi

if [ -d "apps/web/node_modules" ]; then
    rm -rf apps/web/node_modules
fi

# 2. Instalar dependências
print_step "2/7 Instalando dependências com pnpm..."
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm não está instalado. Instale com: npm install -g pnpm"
    exit 1
fi

pnpm install
print_success "Dependências instaladas"

# 3. Configurar variáveis de ambiente (se não existir)
print_step "3/7 Verificando variáveis de ambiente..."
if [ ! -f "apps/api/.env" ]; then
    print_warning ".env não encontrado, criando arquivo padrão..."
    cat > apps/api/.env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# File Upload
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES=".csv,.xlsx,.xls"

# CORS
CORS_ORIGIN="http://localhost:5173"
CORS_CREDENTIALS="true"

# Logging
LOG_LEVEL="info"
LOG_ERRORS="true"

# Seed
SEED_EMAIL="admin@financeflow.com"
SEED_PASSWORD="admin123"
SEED_NAME="Admin User"
EOF
    print_success "Arquivo .env criado"
else
    print_success ".env já existe"
fi

# 4. Limpar banco de dados e migrations inválidas
print_step "4/7 Limpando banco de dados e migrations inválidas..."
if [ -f "apps/api/prisma/dev.db" ]; then
    rm -f apps/api/prisma/dev.db
    print_success "Banco de dados antigo removido"
else
    print_warning "Banco de dados não encontrado, criando novo..."
fi

# Remover migrations inválidas (diretórios sem migration.sql)
print_step "   Verificando migrations inválidas..."
cd apps/api
for migration_dir in prisma/migrations/*/; do
    if [ -d "$migration_dir" ] && [ ! -f "$migration_dir/migration.sql" ]; then
        print_warning "   Removendo migration inválida: $(basename "$migration_dir")"
        rm -rf "$migration_dir"
    fi
done
cd ../..

# 5. Rodar migrations
print_step "5/7 Aplicando migrations do Prisma..."
cd apps/api

# Instalar dependências do API (se necessário)
if [ ! -d "node_modules" ]; then
    print_step "   Instalando dependências do API..."
    pnpm install
fi

# Configurar DATABASE_URL
export DATABASE_URL="file:./prisma/dev.db"

# Gerar Prisma Client primeiro
print_step "   Gerando Prisma Client..."
DATABASE_URL="file:./prisma/dev.db" pnpm prisma:generate || {
    print_error "Erro ao gerar Prisma Client"
    exit 1
}

# Aplicar migrations
print_step "   Aplicando migrations..."

# Verificar se há migrations válidas
MIGRATIONS_COUNT=$(find prisma/migrations -name "migration.sql" 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATIONS_COUNT" -gt 0 ]; then
    # Tentar aplicar migrations existentes
    DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy 2>/dev/null || {
        print_warning "Migrations existentes falharam, resetando banco..."
        # Resetar banco e aplicar migrations novamente
        DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate reset --force --skip-seed 2>/dev/null || true
        DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate deploy || {
            print_error "Erro ao aplicar migrations existentes"
            exit 1
        }
    }
else
    # Se não houver migrations, criar novas
    print_step "   Criando migrations iniciais..."
    DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate dev --name init || {
        print_error "Erro ao criar migrations iniciais"
        exit 1
    }
fi

print_success "Migrations aplicadas"

# 6. Rodar seed (usuário, categorias padrão e cartões)
print_step "6/7 Executando seed do banco de dados..."

# Garantir que estamos em apps/api
cd apps/api

print_step "   Criando usuário padrão e categorias..."

# Executar seed principal
DATABASE_URL="file:./prisma/dev.db" pnpm prisma:seed || {
    print_error "Erro ao executar seed"
    exit 1
}

# Criar alguns cartões de exemplo
print_step "   Criando cartões de exemplo..."
CARD_SEED_FILE="prisma/seed-cards.ts"
cat > "$CARD_SEED_FILE" << 'EOF'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('⚠️  Nenhum usuário encontrado. Execute o seed principal primeiro.');
    return;
  }

  const cards = [
    {
      name: 'Nubank Roxinho',
      bank: 'NUBANK',
      lastFourDigits: '1234',
      bestPurchaseDay: 5,
      dueDay: 10,
      closingDay: 5,
      limit: '5000.00',
      isActive: true,
    },
    {
      name: 'Inter',
      bank: 'INTER',
      lastFourDigits: '5678',
      bestPurchaseDay: 1,
      dueDay: 15,
      closingDay: 1,
      limit: '3000.00',
      isActive: true,
    },
    {
      name: 'Itaú',
      bank: 'ITAU',
      lastFourDigits: '9012',
      bestPurchaseDay: 10,
      dueDay: 20,
      closingDay: 10,
      limit: '8000.00',
      isActive: true,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const cardData of cards) {
    const existing = await prisma.card.findFirst({
      where: {
        userId: user.id,
        name: cardData.name,
      },
    });

    if (!existing) {
      await prisma.card.create({
        data: {
          ...cardData,
          userId: user.id,
        },
      });
      console.log(`  ✅ ${cardData.name} criado`);
      created++;
    } else {
      console.log(`  ⏭️  ${cardData.name} já existe`);
      skipped++;
    }
  }

  console.log(`\n📊 Cartões: ${created} criados, ${skipped} já existiam`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar cartões:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
EOF

DATABASE_URL="file:./prisma/dev.db" tsx "$CARD_SEED_FILE" || print_warning "Erro ao criar cartões (pode ser normal se já existirem)"
rm -f "$CARD_SEED_FILE"

print_success "Seed concluído"

# 7. Criar arquivos CSV de exemplo para teste
print_step "7/7 Criando arquivos CSV de exemplo para teste..."

# Voltar para a raiz do projeto
cd ../..
mkdir -p data

# Criar CSV no formato Nubank (formato mais comum)
cat > data/sample-nubank.csv << 'EOF'
date,title,amount
2025-01-15,Compra no Supermercado,-150.50
2025-01-16,Salário,5000.00
2025-01-17,Restaurante,-85.00
2025-01-18,Combustível,-200.00
2025-01-19,Farmacia,-45.30
2025-01-20,Uber,-25.00
EOF

# Criar CSV no formato brasileiro (com vírgula)
cat > data/sample-brasil.csv << 'EOF'
Data,Descrição,Valor,Categoria
15/01/2025,Compra no Supermercado,150,50,Alimentação
16/01/2025,Salário,-5000,00,Receita
17/01/2025,Restaurante,85,00,Alimentação
18/01/2025,Combustível,200,00,Transporte
EOF

print_success "Arquivos CSV de exemplo criados:"
echo "   📄 data/sample-nubank.csv (formato Nubank)"
echo "   📄 data/sample-brasil.csv (formato brasileiro)"
echo ""
print_warning "   Para testar a importação:"
echo "   1. Inicie o servidor: cd apps/api && pnpm dev"
echo "   2. Acesse a interface web e faça login"
echo "   3. Vá em Transações > Importar CSV"
echo "   4. Selecione um dos arquivos CSV de exemplo"

# Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Configuração concluída com sucesso! 🎉"
echo ""
echo "📋 Resumo:"
echo "   ✅ Dependências instaladas"
echo "   ✅ Migrations aplicadas"
echo "   ✅ Banco de dados criado"
echo "   ✅ Usuário padrão criado"
echo "   ✅ Categorias padrão criadas"
echo "   ✅ Cartões de exemplo criados"
echo ""
echo "🔑 Credenciais padrão:"
echo "   Email: admin@financeflow.com"
echo "   Senha: admin123"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Inicie o servidor backend:"
echo "      cd apps/api && pnpm dev"
echo ""
echo "   2. Em outro terminal, inicie o frontend:"
echo "      cd apps/web && pnpm dev"
echo ""
echo "   3. Acesse: http://localhost:5173"
echo ""
echo "   4. Faça login com as credenciais acima"
echo ""
echo "   5. Teste a importação CSV na página de Transações"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
