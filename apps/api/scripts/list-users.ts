import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('👥 Listando todos os usuários...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados.');
      return;
    }

    console.log(`✅ ${users.length} usuário(s) encontrado(s)\n`);
    console.log('═'.repeat(80));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   📅 Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
    });

    console.log('\n' + '═'.repeat(80));
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();