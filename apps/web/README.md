# FinanceFlow Web

Frontend React do sistema financeiro pessoal.

## Tecnologias

- React 18 + TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query
- Zustand
- React Router

## Estrutura

```
src/
├── components/      # Componentes React
│   └── ui/         # Componentes shadcn/ui
├── lib/            # Utilitários
├── pages/          # Páginas da aplicação
├── services/       # Serviços de API
├── stores/         # Zustand stores
└── App.tsx         # Componente principal
```

## Setup

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000
```

