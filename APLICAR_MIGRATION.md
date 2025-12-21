# Como Aplicar a Migration de Categorias Padrão

O banco de dados precisa ser atualizado para incluir o campo `isDefault` na tabela `categories` e tornar `userId` opcional.

## Opção 1: Usar o Prisma Migrate (Recomendado)

```bash
cd apps/api

# Criar e aplicar a migration
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate dev --name add_category_is_default

# Regenerar o Prisma Client
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma generate
```

## Opção 2: Aplicar SQL Manualmente

Se o Prisma Migrate não funcionar, você pode aplicar o SQL manualmente:

```bash
cd apps/api
sqlite3 prisma/dev.db < prisma/migrations/20251221040000_add_category_is_default/migration.sql
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma generate
```

## Opção 3: Resetar o Banco (Apaga todos os dados)

Se você não se importa em perder os dados existentes:

```bash
cd apps/api
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma migrate reset
DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma generate
DATABASE_URL="file:./prisma/dev.db" pnpm prisma:seed
```

## Verificar se Funcionou

Após aplicar a migration, verifique se a coluna foi criada:

```bash
cd apps/api
sqlite3 prisma/dev.db "PRAGMA table_info(categories);"
```

Você deve ver a coluna `isDefault` na lista.

## Depois da Migration

Após aplicar a migration com sucesso, execute o seed novamente para criar as categorias padrão:

```bash
cd apps/api
DATABASE_URL="file:./prisma/dev.db" pnpm prisma:seed
```

Isso criará as 8 categorias padrão com `isDefault = true` e `userId = null`.

