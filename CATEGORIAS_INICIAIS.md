# Categorias Iniciais

Este documento descreve as categorias padrão que são criadas automaticamente quando você executa o seed do banco de dados.

## Categorias Criadas

As seguintes categorias são criadas automaticamente para cada novo usuário:

| Categoria | Tipo | Cor | Ícone |
|-----------|------|-----|-------|
| Moradia | EXPENSE | #8B5CF6 (Roxo) | Home |
| Alimentação | EXPENSE | #F59E0B (Laranja) | UtensilsCrossed |
| Saúde | EXPENSE | #EF4444 (Vermelho) | Heart |
| Educação | EXPENSE | #3B82F6 (Azul) | GraduationCap |
| Despesas Pessoais | EXPENSE | #EC4899 (Rosa) | User |
| Transporte | EXPENSE | #10B981 (Verde) | Car |
| Celular/TV/Internet | EXPENSE | #6366F1 (Índigo) | Wifi |
| Lazer | EXPENSE | #14B8A6 (Ciano) | Gamepad2 |

## Como Executar o Seed

Para criar essas categorias no banco de dados, execute:

```bash
cd apps/api
pnpm prisma:seed
```

Ou diretamente:

```bash
cd apps/api
pnpm exec tsx prisma/seed.ts
```

## Comportamento

- Se o usuário já existir, as categorias serão criadas apenas se ainda não existirem
- Se uma categoria com o mesmo nome já existir para o usuário, ela será ignorada
- Todas as categorias são do tipo `EXPENSE` (Despesas)

## Ícones

Os ícones são baseados na biblioteca [Lucide React](https://lucide.dev/). Os nomes dos ícones correspondem aos componentes disponíveis no lucide-react:

- `Home` - Ícone de casa
- `UtensilsCrossed` - Ícone de talheres
- `Heart` - Ícone de coração
- `GraduationCap` - Ícone de capelo de formatura
- `User` - Ícone de usuário
- `Car` - Ícone de carro
- `Wifi` - Ícone de WiFi
- `Gamepad2` - Ícone de controle de videogame

## Personalização

Você pode modificar as categorias padrão editando o arquivo `apps/api/prisma/seed.ts` e alterando o array `defaultCategories`.

