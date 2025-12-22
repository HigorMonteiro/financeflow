import { prisma } from '../config/database';
import { disconnectDatabase } from '../config/database';

async function deleteUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('❌ Uso: pnpm delete-user <email>');
    console.log('');
    console.log('Exemplo:');
    console.log('  pnpm delete-user usuario@email.com');
    process.exit(1);
  }

  const email = args[0];

  try {
    console.log(`🔍 Buscando usuário com email ${email}...`);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      console.log(`❌ Usuário com email ${email} não encontrado!`);
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${existingUser.name} (${existingUser.email})`);
    console.log('🗑️  Excluindo usuário e todos os dados relacionados...');

    // O Prisma vai deletar em cascata devido ao onDelete: Cascade
    await prisma.user.delete({
      where: { email },
    });

    console.log('');
    console.log('✅ Usuário excluído com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nome: ${existingUser.name}`);
    console.log('');
    console.log('⚠️  Todos os dados relacionados foram excluídos (transações, contas, categorias, etc.)');
  } catch (error: any) {
    console.error('❌ Erro ao excluir usuário:', error.message || error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

deleteUser();

