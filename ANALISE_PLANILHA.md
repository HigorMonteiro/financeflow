# 📊 Análise e Adaptação da Planilha Financeira

Este documento explica como adaptar o sistema para refletir sua planilha Excel.

## 🔍 Passo 1: Analisar a Planilha

Execute o script para ver a estrutura da planilha:

```bash
cd apps/api
pnpm install  # Instala xlsx se ainda não estiver instalado
pnpm read-excel
```

Isso mostrará:
- Nomes das abas (sheets)
- Cabeçalhos de cada aba
- Exemplos de dados
- Estrutura geral

## 📋 Estrutura Esperada (Comum em Planilhas Financeiras)

Geralmente, planilhas financeiras têm:

### 1. **Aba de Transações/Extrato**
- Data
- Descrição
- Categoria
- Valor (Receita/Despesa)
- Conta/Banco
- Tags/Etiquetas

### 2. **Aba de Categorias**
- Nome da Categoria
- Tipo (Receita/Despesa)
- Cor
- Ícone

### 3. **Aba de Contas**
- Nome da Conta
- Tipo (Corrente/Poupança/Cartão)
- Saldo Inicial
- Moeda

### 4. **Aba de Metas**
- Nome da Meta
- Valor Alvo
- Valor Atual
- Prazo
- Tipo

### 5. **Aba de Orçamentos**
- Categoria
- Valor Mensal/Anual
- Período

## 🔄 Passo 2: Mapear para o Sistema

O sistema atual já suporta:

✅ **Transações** - Modelo `Transaction`
- `date` - Data
- `description` - Descrição
- `amount` - Valor
- `type` - Tipo (INCOME/EXPENSE)
- `categoryId` - Categoria
- `accountId` - Conta
- `tags` - Tags (JSON array)

✅ **Categorias** - Modelo `Category`
- `name` - Nome
- `type` - Tipo (INCOME/EXPENSE)
- `color` - Cor
- `icon` - Ícone

✅ **Contas** - Modelo `Account`
- `name` - Nome
- `type` - Tipo (CHECKING/SAVINGS/CREDIT_CARD/etc)
- `balance` - Saldo
- `currency` - Moeda

✅ **Metas** - Modelo `Goal`
- `name` - Nome
- `targetAmount` - Valor Alvo
- `currentAmount` - Valor Atual
- `deadline` - Prazo
- `type` - Tipo

✅ **Orçamentos** - Modelo `Budget`
- `categoryId` - Categoria
- `amount` - Valor
- `period` - Período (MONTHLY/YEARLY)

## 🛠️ Passo 3: Criar Script de Importação

Após analisar sua planilha, vamos criar um script de importação customizado.

### Exemplo de Script de Importação

```typescript
// apps/api/src/scripts/import-from-excel.ts
import * as XLSX from 'xlsx';
import { prisma } from '../config/database';
import { AccountType, CategoryType, TransactionType } from '../types/enums';

async function importFromExcel(userId: string, filePath: string) {
  const workbook = XLSX.readFile(filePath);
  
  // Importar categorias (se houver aba de categorias)
  if (workbook.SheetNames.includes('Categorias')) {
    // ... código de importação
  }
  
  // Importar contas (se houver aba de contas)
  if (workbook.SheetNames.includes('Contas')) {
    // ... código de importação
  }
  
  // Importar transações (aba principal)
  // ... código de importação
}
```

## 📝 Próximos Passos

1. **Execute o script de análise:**
   ```bash
   cd apps/api
   pnpm read-excel
   ```

2. **Compartilhe a estrutura** mostrada pelo script

3. **Vou criar o script de importação** customizado para sua planilha

4. **Implementar funcionalidade de upload** no frontend

## 🎯 Funcionalidades a Implementar

- [ ] Upload de arquivo Excel via interface web
- [ ] Parser customizado baseado na estrutura da sua planilha
- [ ] Validação e tratamento de erros
- [ ] Preview antes de importar
- [ ] Relatório de importação (sucessos/erros)
- [ ] Mapeamento de colunas (se necessário)

## 💡 Dica

Se sua planilha tiver uma estrutura muito específica, podemos criar um arquivo de configuração de mapeamento:

```json
{
  "sheets": {
    "Transações": {
      "headers": {
        "date": "Data",
        "description": "Descrição",
        "amount": "Valor",
        "category": "Categoria",
        "account": "Conta"
      },
      "rowStart": 2
    }
  }
}
```

