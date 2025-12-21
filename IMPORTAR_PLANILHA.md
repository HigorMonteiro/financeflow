# 📊 Como Importar sua Planilha Excel

O sistema agora suporta importação de planilhas Excel! Siga estes passos:

## 🔍 Passo 1: Analisar sua Planilha

Primeiro, vamos entender a estrutura da sua planilha:

```bash
cd apps/api
pnpm install  # Instala xlsx se ainda não estiver instalado
pnpm read-excel
```

Isso mostrará:
- ✅ Nomes das abas (sheets)
- ✅ Cabeçalhos de cada aba
- ✅ Exemplos de dados
- ✅ Estrutura completa

## 📋 Estrutura Esperada

O sistema procura por estas abas (nomes em português ou inglês):

### 1. **Aba de Transações** (obrigatória)
Nomes aceitos: `Transações`, `Transactions`, `Extrato`, `Movimentações`, `Dados`

Colunas esperadas:
- **Data** - Data da transação
- **Descrição** - Descrição da transação
- **Valor** - Valor (positivo para receita, negativo para despesa)
- **Categoria** - Nome da categoria
- **Conta** (opcional) - Nome da conta
- **Tipo** (opcional) - Receita/Despesa

### 2. **Aba de Categorias** (opcional)
Nomes aceitos: `Categorias`, `Categories`, `Categoria`

Colunas esperadas:
- **Nome** - Nome da categoria
- **Tipo** - Receita ou Despesa
- **Cor** (opcional) - Cor em hexadecimal
- **Ícone** (opcional) - Nome do ícone

### 3. **Aba de Contas** (opcional)
Nomes aceitos: `Contas`, `Accounts`, `Conta`

Colunas esperadas:
- **Nome** - Nome da conta
- **Tipo** - Corrente, Poupança, Cartão, etc.
- **Saldo** (opcional) - Saldo inicial
- **Moeda** (opcional) - BRL, USD, etc.

## 🚀 Passo 2: Importar via API

### Opção A: Via cURL

```bash
curl -X POST http://localhost:3000/api/import/excel \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "file=@planilha_financeira_completa.xlsx"
```

### Opção B: Via Postman/Insomnia

1. Método: `POST`
2. URL: `http://localhost:3000/api/import/excel`
3. Headers:
   - `Authorization: Bearer SEU_TOKEN_JWT`
4. Body → form-data:
   - Key: `file` (tipo: File)
   - Value: Selecione seu arquivo Excel

### Resposta de Sucesso

```json
{
  "message": "Importação concluída com sucesso",
  "success": true,
  "imported": {
    "categories": 15,
    "accounts": 3,
    "transactions": 250
  },
  "errors": []
}
```

### Resposta com Erros

```json
{
  "success": false,
  "imported": {
    "categories": 10,
    "accounts": 2,
    "transactions": 200
  },
  "errors": [
    "Erro ao importar transação: Categoria não encontrada",
    "Erro ao importar categoria: Nome duplicado"
  ]
}
```

## 🎨 Passo 3: Criar Componente no Frontend (Próximo)

Em breve, criaremos um componente React para fazer upload diretamente pela interface web.

## 🔧 Personalização

Se sua planilha tiver uma estrutura diferente, você pode:

1. **Renomear as abas** para os nomes esperados
2. **Ajustar os cabeçalhos** das colunas
3. **Modificar o serviço** `excel-import.service.ts` para sua estrutura específica

## 📝 Exemplo de Planilha

### Aba "Transações"
| Data | Descrição | Valor | Categoria | Conta |
|------|-----------|-------|-----------|-------|
| 01/01/2024 | Salário | 5000 | Salário | Banco Principal |
| 05/01/2024 | Supermercado | -350 | Alimentação | Cartão de Crédito |
| 10/01/2024 | Conta de Luz | -150 | Utilidades | Banco Principal |

### Aba "Categorias"
| Nome | Tipo | Cor | Ícone |
|------|------|-----|-------|
| Salário | Receita | #10B981 | dollar-sign |
| Alimentação | Despesa | #EF4444 | shopping-cart |
| Utilidades | Despesa | #3B82F6 | zap |

### Aba "Contas"
| Nome | Tipo | Saldo | Moeda |
|------|------|-------|-------|
| Banco Principal | Corrente | 1000 | BRL |
| Cartão de Crédito | Cartão | 0 | BRL |
| Poupança | Poupança | 5000 | BRL |

## ⚠️ Limitações

- Tamanho máximo do arquivo: 10MB
- Formatos suportados: `.xlsx`, `.xls`, `.csv`
- O sistema cria categorias e contas automaticamente se não existirem
- Transações duplicadas podem ser criadas (não há verificação de duplicatas)

## 🐛 Troubleshooting

### Erro: "Nenhuma aba de transações encontrada"
- Verifique se sua planilha tem uma aba com nome: `Transações`, `Transactions`, `Extrato`, `Movimentações` ou `Dados`
- Renomeie a aba se necessário

### Erro: "Nenhuma conta encontrada"
- Crie uma conta primeiro via API ou interface
- Ou adicione uma aba "Contas" na planilha

### Erro: "Tipo de arquivo não suportado"
- Use apenas `.xlsx`, `.xls` ou `.csv`
- Certifique-se de que o arquivo não está corrompido

## 📚 Próximos Passos

1. ✅ Analise sua planilha: `pnpm read-excel`
2. ✅ Ajuste a estrutura se necessário
3. ✅ Importe via API
4. 🔄 Componente de upload no frontend (em desenvolvimento)

