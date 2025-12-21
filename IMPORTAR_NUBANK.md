# 🏦 Importar CSV do Nubank

O sistema agora suporta importação direta de CSV do Nubank!

## 📋 Formato do Nubank

O CSV do Nubank tem o seguinte formato:

```csv
date,title,amount
2025-12-20,Studio Z - Parcela 1/3,106.66
2025-12-20,Burger King,72.80
2025-12-05,Pagamento recebido,-4558.53
```

### Colunas do Nubank

- **date** - Data no formato YYYY-MM-DD
- **title** - Descrição da transação
- **amount** - Valor (positivo = despesa, negativo = receita)

## 🔄 Conversão Automática

O sistema converte automaticamente:

1. **Colunas**: `date` → Data, `title` → Descrição, `amount` → Valor
2. **Valores**: 
   - Valores **negativos** → Receitas (ex: `-4558.53` = Receita de R$ 4.558,53)
   - Valores **positivos** → Despesas (ex: `106.66` = Despesa de R$ 106,66)
3. **Datas**: Formato YYYY-MM-DD é reconhecido automaticamente
4. **Categorias**: Criadas automaticamente como "Outros" se não especificadas

## 📝 Como Importar

1. Exporte seu extrato do Nubank em CSV
2. Acesse a página de Transações
3. Clique em "Importar CSV"
4. Selecione o arquivo CSV do Nubank
5. Aguarde o processamento

## ✅ Exemplo de Importação

### CSV do Nubank:
```csv
date,title,amount
2025-12-20,Burger King,72.80
2025-12-05,Pagamento recebido,-4558.53
```

### Resultado no Sistema:
- **Transação 1**: Despesa de R$ 72,80 em "Burger King"
- **Transação 2**: Receita de R$ 4.558,53 em "Pagamento recebido"

## 🎯 Detecção Automática

O sistema detecta automaticamente:
- ✅ Formato Nubank (colunas em inglês)
- ✅ Formato brasileiro (colunas em português)
- ✅ Formato customizado (com categorias e contas)

## 💡 Dicas

1. **Estornos**: Valores negativos de estornos são tratados como receitas
2. **Parcelas**: O sistema mantém a descrição completa (ex: "Parcela 1/3")
3. **Categorias**: Você pode editar as categorias depois da importação
4. **Conta**: Se não especificada, usa a conta padrão ou cria "Conta Principal"

## 🔍 Troubleshooting

### Erro: "Colunas obrigatórias não encontradas"

Se você receber este erro:
1. Verifique se o CSV tem as colunas: `date`, `title`, `amount`
2. Verifique se a primeira linha é o cabeçalho
3. Verifique se não há espaços extras nos nomes das colunas

### Valores não estão sendo importados corretamente

- Valores negativos no Nubank = Receitas no sistema
- Valores positivos no Nubank = Despesas no sistema
- Isso é o comportamento esperado!

### Datas não estão sendo reconhecidas

O formato YYYY-MM-DD (ex: 2025-12-20) é suportado automaticamente.
Se houver problema, verifique se a data está no formato correto.

