# Troubleshooting - Prisma

## Problema 1: Prisma CLI Version 7.x

Se você está vendo o erro:
```
error: The datasource property `url` is no longer supported in schema files
```

Isso significa que você tem o Prisma CLI versão 7.x instalado globalmente, mas o projeto usa Prisma 5.7.1.

## Problema 2: SQLite não suporta Enums

Se você está vendo o erro:
```
error: Error validating: You defined the enum `AccountType`. But the current connector does not support enums.
```

Isso acontece porque SQLite não suporta enums nativamente. O schema já foi ajustado para usar `String` em vez de enums. Para type safety no código TypeScript, use as constantes definidas em `src/types/enums.ts`.

## Solução

### Opção 1: Usar a versão local (Recomendado)

```bash
cd apps/api

# Usar pnpm exec para garantir que use a versão local
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

### Opção 2: Usar npx com versão específica

```bash
cd apps/api
npx --yes prisma@5.7.1 generate
npx --yes prisma@5.7.1 migrate dev --name init
```

### Opção 3: Usar o caminho direto do node_modules

```bash
cd apps/api
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma migrate dev --name init
```

### Opção 4: Desinstalar Prisma global e usar apenas local

```bash
# Desinstalar Prisma global
npm uninstall -g prisma

# Depois usar apenas a versão local
cd apps/api
pnpm exec prisma generate
```

## Verificar versão do Prisma

```bash
# Versão global (pode ser 7.x)
prisma --version

# Versão local do projeto
cd apps/api
pnpm exec prisma --version
```

A versão local deve ser `5.7.1`.

