# 📋 User Story: Gestão de Metas de Economia

## 🎯 História do Usuário

**Como** um usuário do sistema financeiro  
**Eu quero** criar, visualizar, editar e acompanhar minhas metas de economia  
**Para que** eu possa planejar e alcançar objetivos financeiros específicos, como viagens, fundo de emergência ou compras planejadas

---

## 📝 Descrição Detalhada

Atualmente, o sistema possui o modelo de dados para metas (`Goal`) no banco de dados e exibe metas existentes no Dashboard. No entanto, não há interface ou endpoints para que o usuário possa gerenciar suas próprias metas.

Esta feature permitirá que os usuários:
- Criem metas financeiras com valor alvo e prazo
- Acompanhem o progresso em tempo real
- Atualizem o valor atual das metas manualmente ou automaticamente
- Visualizem todas as metas em uma página dedicada
- Editem ou removam metas conforme necessário

---

## ✅ Critérios de Aceitação

### 1. Criar Meta
- [ ] **Como usuário autenticado**, posso acessar a página de Metas
- [ ] **Como usuário**, posso criar uma nova meta preenchendo:
  - Nome da meta (obrigatório, mínimo 3 caracteres)
  - Valor alvo (obrigatório, maior que zero)
  - Valor atual (opcional, padrão: R$ 0,00)
  - Tipo de meta (Fundo de Emergência, Viagem, Compra, Investimento, Outro)
  - Data limite (opcional)
- [ ] **Como usuário**, vejo validação em tempo real dos campos
- [ ] **Como usuário**, recebo feedback de sucesso após criar a meta
- [ ] **Como usuário**, a meta criada aparece imediatamente na lista

### 2. Visualizar Metas
- [ ] **Como usuário**, vejo todas as minhas metas em uma lista organizada
- [ ] **Como usuário**, vejo para cada meta:
  - Nome da meta
  - Valor atual vs valor alvo
  - Porcentagem de progresso (barra visual)
  - Tipo da meta
  - Data limite (se definida)
  - Dias restantes (se houver prazo)
- [ ] **Como usuário**, vejo metas ordenadas por:
  - Data limite (mais próximas primeiro)
  - Progresso (mais próximas de completar primeiro)
  - Data de criação (mais recentes primeiro)
- [ ] **Como usuário**, vejo indicadores visuais:
  - Meta concluída (100% ou mais)
  - Meta próxima do prazo (menos de 30 dias)
  - Meta em atraso (prazo vencido)

### 3. Editar Meta
- [ ] **Como usuário**, posso editar qualquer campo de uma meta existente
- [ ] **Como usuário**, posso atualizar o valor atual da meta manualmente
- [ ] **Como usuário**, recebo confirmação antes de salvar alterações
- [ ] **Como usuário**, vejo as alterações refletidas imediatamente

### 4. Deletar Meta
- [ ] **Como usuário**, posso deletar uma meta que não desejo mais
- [ ] **Como usuário**, recebo confirmação antes de deletar
- [ ] **Como usuário**, a meta é removida da lista após confirmação

### 5. Integração com Dashboard
- [ ] **Como usuário**, vejo minhas metas no Dashboard (já implementado)
- [ ] **Como usuário**, ao clicar em uma meta no Dashboard, sou redirecionado para a página de Metas
- [ ] **Como usuário**, o progresso das metas é atualizado automaticamente no Dashboard

### 6. Validações e Segurança
- [ ] **Como sistema**, valido que o valor atual não pode ser negativo
- [ ] **Como sistema**, valido que o valor alvo deve ser maior que zero
- [ ] **Como sistema**, valido que apenas o dono da meta pode editá-la/deletá-la
- [ ] **Como sistema**, exibo mensagens de erro claras em caso de falha

---

## 🏗️ Requisitos Técnicos

### Backend

#### 1. Controller (`goal.controller.ts`)
```typescript
- getAll(req, res) - Listar todas as metas do usuário
- getById(req, res) - Buscar meta específica
- create(req, res) - Criar nova meta
- update(req, res) - Atualizar meta existente
- delete(req, res) - Deletar meta
```

#### 2. Service (`goal.service.ts`)
```typescript
- getAll(userId) - Buscar todas as metas do usuário
- getById(userId, goalId) - Buscar meta específica
- create(userId, data) - Criar nova meta
- update(userId, goalId, data) - Atualizar meta
- delete(userId, goalId) - Deletar meta
- calculateProgress(currentAmount, targetAmount) - Calcular progresso
```

#### 3. Rotas (`goal.routes.ts`)
```typescript
GET    /api/goals           - Listar metas
GET    /api/goals/:id       - Buscar meta específica
POST   /api/goals           - Criar meta
PUT    /api/goals/:id       - Atualizar meta
DELETE /api/goals/:id       - Deletar meta
```

#### 4. Validações
- Usar Zod para validação de entrada
- Validar tipos de meta (enum `GoalType`)
- Validar valores monetários (positivos)
- Validar datas (deadline não pode ser no passado ao criar)

### Frontend

#### 1. Service (`goals.service.ts`)
```typescript
- getAll() - Buscar todas as metas
- getById(id) - Buscar meta específica
- create(data) - Criar meta
- update(id, data) - Atualizar meta
- delete(id) - Deletar meta
```

#### 2. Página (`Goals.tsx`)
- Lista de metas com cards
- Modal/formulário para criar/editar
- Filtros e ordenação
- Indicadores visuais de progresso

#### 3. Componentes
- `GoalCard.tsx` - Card individual de meta
- `GoalForm.tsx` - Formulário de criação/edição
- `GoalProgressBar.tsx` - Barra de progresso visual
- `GoalFilters.tsx` - Filtros e ordenação

---

## 📊 Modelo de Dados

### Schema Prisma (já existe)
```prisma
model Goal {
  id            String   @id @default(cuid())
  userId        String
  name          String
  targetAmount  String
  currentAmount String   @default("0")
  deadline      DateTime?
  type          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("goals")
}
```

### Tipos TypeScript

**Backend:**
```typescript
interface CreateGoalDTO {
  name: string;
  targetAmount: string;
  currentAmount?: string;
  deadline?: string;
  type: GoalType;
}

interface UpdateGoalDTO {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  deadline?: string;
  type?: GoalType;
}
```

**Frontend:**
```typescript
interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  type: GoalType;
  progress: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 Mockups e Comportamento Esperado

### Página de Metas
```
┌─────────────────────────────────────────────────────────┐
│ Metas                                    [+ Nova Meta]  │
│ Gerencie suas metas de economia                        │
├─────────────────────────────────────────────────────────┤
│ [Filtros: Todas | Em Andamento | Concluídas]           │
│ [Ordenar: Prazo | Progresso | Data]                    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎯 Viagem para Europa          [85%] [Editar] [🗑] │ │
│ │ R$ 8.500,00 / R$ 10.000,00                         │ │
│ │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ Prazo: 15/06/2024 (45 dias restantes)               │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💰 Fundo de Emergência         [30%] [Editar] [🗑] │ │
│ │ R$ 3.000,00 / R$ 10.000,00                         │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ Sem prazo definido                                  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Modal de Criação/Edição
```
┌─────────────────────────────────────────┐
│ Nova Meta                        [X]    │
├─────────────────────────────────────────┤
│ Nome da Meta *                          │
│ [_____________________________]          │
│                                         │
│ Valor Alvo *                            │
│ [R$ _____________]                      │
│                                         │
│ Valor Atual                             │
│ [R$ _____________]                      │
│                                         │
│ Tipo de Meta *                          │
│ [Selecione... ▼]                        │
│                                         │
│ Data Limite (opcional)                  │
│ [__/__/____]                            │
│                                         │
│              [Cancelar]  [Salvar]      │
└─────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Trabalho

### Criar Meta
1. Usuário acessa página de Metas
2. Clica em "Nova Meta"
3. Preenche formulário
4. Clica em "Salvar"
5. Sistema valida dados
6. Meta é criada no backend
7. Lista é atualizada automaticamente
8. Feedback de sucesso é exibido

### Editar Meta
1. Usuário visualiza lista de metas
2. Clica em "Editar" em uma meta
3. Modal abre com dados preenchidos
4. Usuário modifica campos desejados
5. Clica em "Salvar"
6. Sistema valida e atualiza
7. Lista é atualizada
8. Feedback de sucesso é exibido

### Deletar Meta
1. Usuário visualiza lista de metas
2. Clica em "Deletar" em uma meta
3. Modal de confirmação aparece
4. Usuário confirma deleção
5. Meta é removida do backend
6. Lista é atualizada
7. Feedback de sucesso é exibido

---

## 🧪 Casos de Teste

### Testes Unitários (Backend)
- [ ] Criar meta com dados válidos
- [ ] Criar meta sem valor atual (deve usar padrão 0)
- [ ] Criar meta com data limite no passado (deve falhar)
- [ ] Atualizar valor atual da meta
- [ ] Deletar meta existente
- [ ] Tentar acessar meta de outro usuário (deve falhar)
- [ ] Validar cálculo de progresso

### Testes de Integração
- [ ] Criar meta via API e verificar no banco
- [ ] Atualizar meta e verificar mudanças
- [ ] Deletar meta e verificar remoção
- [ ] Listar metas do usuário autenticado

### Testes E2E (Frontend)
- [ ] Criar meta através da interface
- [ ] Editar meta existente
- [ ] Deletar meta com confirmação
- [ ] Verificar atualização em tempo real
- [ ] Verificar validações de formulário
- [ ] Verificar integração com Dashboard

---

## 📦 Dependências e Integrações

### Dependências Existentes
- ✅ Modelo `Goal` no Prisma Schema
- ✅ Enum `GoalType` em `types/enums.ts`
- ✅ Exibição de metas no Dashboard (via `analytics.service.ts`)

### Novas Dependências
- Nenhuma (todas as dependências necessárias já estão instaladas)

---

## 🚀 Prioridade

**Alta** - Esta feature complementa o sistema de gestão financeira e já possui parte da infraestrutura implementada. É uma funcionalidade esperada pelos usuários que desejam planejar objetivos financeiros.

---

## 📅 Estimativa

**Backend:** 4-6 horas
- Controller: 1h
- Service: 2h
- Rotas e validações: 1h
- Testes: 1-2h

**Frontend:** 6-8 horas
- Service: 1h
- Componentes: 3-4h
- Página principal: 2h
- Testes: 1-2h

**Total:** 10-14 horas

---

## 🔗 Referências

- Modelo de dados: `apps/api/prisma/schema.prisma` (linhas 109-123)
- Enum GoalType: `apps/api/src/types/enums.ts` (linhas 34-42)
- Exibição no Dashboard: `apps/api/src/services/analytics.service.ts` (linhas 150-166)
- Página atual: `apps/web/src/pages/Goals.tsx`

---

**Última atualização:** $(date)

