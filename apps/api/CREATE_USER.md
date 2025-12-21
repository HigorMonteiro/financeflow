# 👤 Como Criar um Usuário

Existem **3 formas** de criar um usuário no sistema:

## 1. Via Frontend (Recomendado) 🎨

A forma mais fácil é usar a interface web:

1. Inicie o servidor:
   ```bash
   pnpm dev
   ```

2. Acesse `http://localhost:5173/register`

3. Preencha o formulário:
   - Nome
   - Email
   - Senha (mínimo 6 caracteres)

4. Clique em "Criar Conta"

5. Você será redirecionado automaticamente para o Dashboard!

## 2. Via API (cURL/Postman) 🔌

Você pode criar um usuário diretamente pela API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "suasenha123",
    "name": "Seu Nome"
  }'
```

Resposta:
```json
{
  "user": {
    "id": "...",
    "email": "seu@email.com",
    "name": "Seu Nome",
    "avatarUrl": null
  },
  "token": "jwt-token-aqui"
}
```

## 3. Via Script CLI (Linha de Comando) 💻

Para criar um usuário diretamente no banco de dados:

```bash
cd apps/api
pnpm create-user seu@email.com suasenha123 "Seu Nome"
```

Exemplo:
```bash
pnpm create-user joao@email.com senha123 "João Silva"
```

## 4. Via Seed (Usuário Padrão) 🌱

Para criar um usuário padrão automaticamente:

```bash
cd apps/api
pnpm prisma:seed
```

Isso criará um usuário com:
- **Email**: `admin@financeflow.com` (ou `SEED_EMAIL` se definido)
- **Senha**: `admin123` (ou `SEED_PASSWORD` se definido)
- **Nome**: `Admin User` (ou `SEED_NAME` se definido)

Você pode customizar usando variáveis de ambiente:

```bash
SEED_EMAIL=meu@email.com \
SEED_PASSWORD=minhasenha \
SEED_NAME="Meu Nome" \
pnpm prisma:seed
```

## 🔐 Fazer Login

Depois de criar o usuário, você pode fazer login:

### Via Frontend:
1. Acesse `http://localhost:5173/login`
2. Digite email e senha
3. Clique em "Entrar"

### Via API:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "suasenha123"
  }'
```

## 📝 Notas Importantes

- A senha é criptografada usando bcrypt antes de ser salva no banco
- O email deve ser único (não pode haver dois usuários com o mesmo email)
- A senha deve ter no mínimo 6 caracteres
- O token JWT expira em 7 dias

## 🐛 Problemas?

Se você receber erro de "Email already registered", significa que já existe um usuário com esse email. Use outro email ou faça login com as credenciais existentes.

