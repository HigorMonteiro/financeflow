# Categorias Padrão do Sistema

Este documento explica como funciona o sistema de categorias padrão que são compartilhadas entre todos os usuários.

## O que são Categorias Padrão?

Categorias padrão são categorias que estão disponíveis para **todos os usuários** do sistema. Elas são criadas automaticamente e não podem ser editadas ou excluídas por usuários individuais.

## Mudanças no Banco de Dados

### Schema Atualizado

O modelo `Category` agora possui:
- `isDefault` (Boolean): Indica se a categoria é padrão do sistema
- `userId` (String?): Agora é opcional (nullable) - categorias padrão não têm userId

### Migration Necessária

Para aplicar as mudanças no banco de dados, execute:

```bash
cd apps/api
pnpm prisma migrate dev --name add_category_is_default
```

Ou se preferir resetar o banco (apaga todos os dados):

```bash
cd apps/api
pnpm prisma migrate reset
```

## Como Funciona

### Criação de Categorias Padrão

As 8 categorias padrão são criadas pelo seed:
- Moradia
- Alimentação
- Saúde
- Educação
- Despesas Pessoais
- Transporte
- Celular/TV/Internet
- Lazer

Essas categorias são criadas **sem userId** e com `isDefault = true`.

### Endpoint GET /api/categories

Retorna:
- Todas as categorias do usuário (`userId` = usuário atual)
- **E** todas as categorias padrão (`isDefault = true`)

### Proteções

- **Edição**: Usuários não podem editar categorias padrão
- **Exclusão**: Usuários não podem excluir categorias padrão
- **Criação**: Apenas admins podem criar novas categorias padrão (via seed ou endpoint admin)

## Como Criar Novas Categorias Padrão

### Via Seed (Recomendado)

Edite `apps/api/prisma/seed.ts` e adicione novas categorias ao array `defaultCategories`.

### Via API (Futuro)

Será necessário criar um endpoint admin para criar categorias padrão:
- `POST /api/admin/categories` (requer role de admin)

## Visualização no Frontend

- Categorias padrão aparecem com badge "Padrão"
- Botões de editar/excluir são ocultados para categorias padrão
- Mensagem "Categoria padrão do sistema" aparece no lugar dos botões

## Migração de Dados Existentes

Se você já tem categorias no banco, você pode:

1. **Opção 1**: Resetar o banco e rodar o seed novamente
   ```bash
   cd apps/api
   pnpm prisma migrate reset
   pnpm prisma:seed
   ```

2. **Opção 2**: Converter categorias existentes para padrão manualmente
   ```sql
   UPDATE categories SET "isDefault" = 1, "userId" = NULL WHERE name IN ('Moradia', 'Alimentação', 'Saúde', 'Educação', 'Despesas Pessoais', 'Transporte', 'Celular/TV/Internet', 'Lazer');
   ```

## Estrutura da Tabela

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  userId TEXT NULL,           -- NULL para categorias padrão
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  isDefault INTEGER DEFAULT 0, -- 0 = false, 1 = true
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

