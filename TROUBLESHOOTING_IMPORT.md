# 🔧 Troubleshooting - Importação CSV

## Erros Comuns e Soluções

### Erro: "Erro ao processar o arquivo"

Este erro genérico pode ter várias causas. Siga estes passos:

#### 1. Verificar Formato do CSV

O CSV deve ter o seguinte formato:

```csv
Data,Descrição,Valor,Categoria,Conta
01/01/2024,Salário,5000,Salário,Banco Principal
05/01/2024,Supermercado,-350,Alimentação,Cartão
```

**Colunas obrigatórias:**
- ✅ **Data** - Formato: DD/MM/YYYY, YYYY-MM-DD ou DD-MM-YYYY
- ✅ **Descrição** - Texto livre
- ✅ **Valor** - Número (positivo para receita, negativo para despesa)

**Colunas opcionais:**
- Categoria (criada automaticamente se não existir)
- Conta (usa conta padrão se não especificada)
- Tipo (detectado automaticamente pelo sinal do valor)

#### 2. Verificar Encoding do Arquivo

O arquivo deve estar em **UTF-8**:

- **Windows**: Salve como "CSV UTF-8" no Excel
- **Mac**: Use "UTF-8" ao exportar
- **Google Sheets**: Download como CSV (já vem em UTF-8)

#### 3. Verificar Delimitador

O sistema aceita:
- ✅ Vírgula (`,`) - padrão
- ✅ Ponto e vírgula (`;`)

Se usar outro delimitador, converta antes de importar.

#### 4. Verificar Primeira Linha (Cabeçalho)

A primeira linha deve conter os nomes das colunas. Nomes aceitos:

**Data:**
- `data`, `date`, `data da transação`

**Descrição:**
- `descrição`, `description`, `descricao`, `desc`

**Valor:**
- `valor`, `amount`, `value`, `vlr`

**Categoria:**
- `categoria`, `category`, `cat`

**Conta:**
- `conta`, `account`, `banco`, `bank`

#### 5. Verificar Dados

**Problemas comuns:**

❌ **Data inválida:**
```
01/13/2024  ← Mês 13 não existe
32/01/2024  ← Dia 32 não existe
```

✅ **Formato correto:**
```
01/01/2024
2024-01-01
01-01-2024
```

❌ **Valor inválido:**
```
R$ 1.500,00  ← Contém símbolos
1.500,00     ← Formato brasileiro pode não funcionar
abc          ← Não é número
```

✅ **Formato correto:**
```
1500
1500.00
-350
```

#### 6. Verificar Logs do Servidor

No terminal onde o servidor está rodando, você verá erros detalhados:

```bash
Erro na importação CSV: [mensagem de erro]
```

Isso ajuda a identificar o problema específico.

#### 7. Testar com CSV Simples

Crie um arquivo CSV mínimo para testar:

```csv
Data,Descrição,Valor
01/01/2024,Teste,100
02/01/2024,Teste 2,-50
```

Se este funcionar, o problema está nos dados do seu arquivo original.

## Erros Específicos

### "Colunas obrigatórias não encontradas"

**Causa:** O cabeçalho não contém as colunas necessárias.

**Solução:** 
- Verifique se a primeira linha tem: Data, Descrição e Valor
- Os nomes podem estar em português ou inglês
- Verifique se há espaços extras ou caracteres especiais

### "Data inválida"

**Causa:** Formato de data não reconhecido.

**Solução:**
- Use formato: DD/MM/YYYY, YYYY-MM-DD ou DD-MM-YYYY
- Evite formatos como: MM/DD/YYYY (americano)
- Certifique-se de que a data é válida

### "Valor inválido"

**Causa:** O valor não pode ser convertido para número.

**Solução:**
- Remova símbolos de moeda (R$, $)
- Use ponto (.) ou vírgula (,) como separador decimal
- Não use separadores de milhar
- Valores negativos devem ter sinal de menos (-)

### "Erro ao criar transação"

**Causa:** Problema ao salvar no banco de dados.

**Solução:**
- Verifique se o banco de dados está rodando
- Verifique se há espaço em disco
- Verifique os logs do servidor para mais detalhes

## Debug

### Habilitar Logs Detalhados

No arquivo `apps/api/src/services/csv-import.service.ts`, os erros já são logados no console.

### Verificar Resposta da API

No navegador, abra o DevTools (F12) → Network → Veja a resposta da requisição `/api/import/csv`.

A resposta incluirá:
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "errors": ["Lista de erros detalhados"],
  "imported": {
    "categories": 0,
    "accounts": 0,
    "transactions": 0
  }
}
```

## Exemplo de CSV Correto

```csv
Data,Descrição,Valor,Categoria,Conta
01/01/2024,Salário,5000,Salário,Banco Principal
05/01/2024,Supermercado,-350,Alimentação,Cartão de Crédito
10/01/2024,Conta de Luz,-150,Utilidades,Banco Principal
15/01/2024,Freelance,1200,Receita Extra,Banco Principal
20/01/2024,Restaurante,-80,Alimentação,Cartão de Crédito
```

## Ainda com Problemas?

1. Verifique os logs do servidor
2. Teste com um CSV simples primeiro
3. Verifique o formato do arquivo (UTF-8)
4. Verifique se todas as colunas obrigatórias estão presentes
5. Compartilhe o erro específico que aparece nos logs

