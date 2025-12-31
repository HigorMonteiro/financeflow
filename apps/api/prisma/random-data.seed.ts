import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function generateRandomData() {
  console.log('🎲 Gerando dados aleatórios...\n');

  // Criar 5 usuários
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: await bcrypt.hash('senha123', 10),
      },
    });

    // 2-3 contas por usuário
    const numAccounts = faker.number.int({ min: 2, max: 3 });
    for (let j = 0; j < numAccounts; j++) {
      await prisma.account.create({
        data: {
          userId: user.id,
          name: faker.finance.accountName(),
          type: faker.helpers.arrayElement(['CHECKING', 'SAVINGS', 'INVESTMENT']),
          balance: faker.finance.amount({ min: 100, max: 50000, dec: 2 }),
          currency: 'BRL',
          color: faker.internet.color(),
        },
      });
    }

    console.log(`✅ ${user.name} - ${numAccounts} contas`);
  }

  console.log('\n✅ Dados aleatórios gerados!');
}

generateRandomData()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });