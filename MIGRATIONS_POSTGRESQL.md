# Migrando de SQLite para PostgreSQL

Se você está usando PostgreSQL em produção mas as migrações foram criadas para SQLite, siga estes passos:

## 🔍 Problema

O Prisma detecta que você está conectado ao PostgreSQL, mas:
- O `migration_lock.toml` está configurado para `sqlite`
- As migrações foram criadas para SQLite
- O Prisma não encontra migrações compatíveis

## ✅ Solução

### Opção 1: Basear Schema no Banco Existente (Recomendado)

Se o banco PostgreSQL já existe e tem dados:

```bash
# 1. Atualizar migration_lock.toml
cd apps/api
node scripts/fix-migration-lock.js

# 2. Marcar o banco como sincronizado (baseline)
pnpm prisma migrate resolve --applied init
pnpm prisma migrate resolve --applied add_category_is_default
# ... para cada migration existente

# 3. Ou criar baseline de todas de uma vez
pnpm prisma migrate resolve --applied "*"
```

### Opção 2: Criar Novas Migrações para PostgreSQL

Se o banco PostgreSQL está vazio:

```bash
# 1. Atualizar migration_lock.toml
cd apps/api
node scripts/fix-migration-lock.js

# 2. Criar migration inicial baseada no schema atual
pnpm prisma migrate dev --name init_postgresql

# 3. Aplicar migrations
pnpm prisma migrate deploy
```

### Opção 3: Resetar e Recriar (⚠️ Apaga Dados)

**ATENÇÃO: Isso apaga todos os dados!**

```bash
# 1. Atualizar migration_lock.toml
cd apps/api
node scripts/fix-migration-lock.js

# 2. Resetar banco e criar migrations do zero
pnpm prisma migrate reset

# 3. Aplicar migrations
pnpm prisma migrate deploy
```

## 🔧 Script Automático

Execute o script para ajustar automaticamente:

```bash
cd apps/api
DATABASE_URL=postgresql://user:pass@host:5432/db node scripts/fix-migration-lock.js
```

## 📝 Verificar Status

Após ajustar:

```bash
pnpm prisma migrate status
```

Deve mostrar que as migrations estão aplicadas ou pendentes corretamente.

## 🚀 Em Produção (Docker)

No Dockerfile, o script já é executado automaticamente. Mas se precisar ajustar manualmente:

```bash
# No container
docker compose exec api node scripts/fix-migration-lock.js
docker compose exec api pnpm prisma migrate deploy
```

## 💡 Dica

Se você tem migrações SQLite mas quer usar PostgreSQL:
1. As migrações SQLite não funcionam diretamente no PostgreSQL
2. Você precisa criar novas migrações para PostgreSQL OU
3. Usar `prisma migrate resolve` para marcar como aplicadas se o schema já existe

