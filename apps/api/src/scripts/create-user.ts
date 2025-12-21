import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { disconnectDatabase } from '../config/database';

async function createUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('❌ Uso: pnpm create-user <email> <senha> <nome>');
    console.log('');
    console.log('Exemplo:');
    console.log('  pnpm create-user usuario@email.com senha123 "João Silva"');
    process.exit(1);
  }

  const [email, password, name] = args;

  try {
    console.log(`🔍 Verificando se usuário ${email} já existe...`);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`❌ Usuário com email ${email} já existe!`);
      process.exit(1);
    }

    console.log('🔐 Criptografando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Criando usuário...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('');
    console.log('✅ Usuário criado com sucesso!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nome: ${user.name}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log('');
    console.log('💡 Agora você pode fazer login com essas credenciais.');
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

createUser();

