import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { disconnectDatabase } from '../config/database';

async function testLogin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Uso: pnpm test-login <email> <senha>');
    console.log('');
    console.log('Exemplo:');
    console.log('  pnpm test-login admin@financeflow.com admin123');
    process.exit(1);
  }

  const [email, password] = args;

  try {
    console.log(`🔍 Buscando usuário: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Usuário não encontrado!`);
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Hash da senha (primeiros 30 chars): ${user.password.substring(0, 30)}...`);
    console.log('');

    console.log(`🔐 Testando senha...`);
    console.log(`   Senha fornecida: ${password}`);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    console.log('');
    if (isValidPassword) {
      console.log('✅ Senha válida! Login funcionaria.');
    } else {
      console.log('❌ Senha inválida! Login falharia.');
      console.log('');
      console.log('💡 Dica: Verifique se está usando a senha correta.');
      console.log('   Para o usuário padrão do seed: admin123');
    }
  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

testLogin();

