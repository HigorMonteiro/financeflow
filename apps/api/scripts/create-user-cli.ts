import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserArgs {
  email: string;
  password: string;
  name: string;
}

function parseArgs(): CreateUserArgs | null {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log('❌ Uso incorreto!\n');
    console.log('📖 Uso correto:');
    console.log('   npx tsx scripts/create-user-cli.ts <email> <nome> <senha>\n');
    console.log('📝 Exemplo:');
    console.log('   npx tsx scripts/create-user-cli.ts user@example.com "João Silva" senha123\n');
    return null;
  }

  return {
    email: args[0],
    name: args[1],
    password: args[2],
  };
}

function validateInput(data: CreateUserArgs): string[] {
  const errors: string[] = [];

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Email inválido');
  }

  // Validar nome
  if (data.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  // Validar senha
  if (data.password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  return errors;
}

async function createUser(data: CreateUserArgs) {
  // Validar entrada
  const errors = validateInput(data);
  if (errors.length > 0) {
    console.log('\n❌ Erros de validação:');
    errors.forEach(error => console.log(`   • ${error}`));
    process.exit(1);
  }

  try {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log(`\n❌ Usuário com email ${data.email} já existe!`);
      process.exit(1);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log('\n✅ Usuário criado com sucesso!');
    console.log('═'.repeat(50));
    console.log(`📋 ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nome: ${user.name}`);
    console.log(`📅 Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
    console.log('═'.repeat(50));
  } catch (error) {
    console.error('\n❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs();
  
  if (!args) {
    process.exit(1);
  }

  try {
    await createUser(args as unknown as CreateUserArgs);
  } finally {
    await prisma.$disconnect();
  }
}

main();