import { prisma } from '../config/database';
import { disconnectDatabase } from '../config/database';

async function createCards() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('❌ Uso: pnpm create-cards <email>');
    console.log('');
    console.log('Exemplo:');
    console.log('  pnpm create-cards usuario@email.com');
    console.log('');
    console.log('Isso criará 3 cartões de crédito:');
    console.log('  - {NomeUsuario}-Nu (Nubank) - Limite: R$ 100,00');
    console.log('  - {NomeUsuario}-Inter (Inter) - Limite: R$ 100,00');
    console.log('  - {NomeUsuario}-Pic (PicPay) - Limite: R$ 100,00');
    process.exit(1);
  }

  const email = args[0];

  try {
    console.log(`🔍 Buscando usuário com email ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Usuário com email ${email} não encontrado!`);
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.name} (${user.email})`);
    console.log('');

    // Criar nome de usuário simplificado (remover espaços e caracteres especiais)
    const username = user.name
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 20); // Limitar tamanho

    const cards = [
      {
        name: `${username}-Nu`,
        bank: 'NUBANK',
        limit: '100.00',
      },
      {
        name: `${username}-Inter`,
        bank: 'INTER',
        limit: '100.00',
      },
      {
        name: `${username}-Pic`,
        bank: 'PICPAY',
        limit: '100.00',
      },
    ];

    console.log('💳 Criando cartões de crédito...');
    let created = 0;
    let skipped = 0;

    for (const cardData of cards) {
      // Verificar se o cartão já existe
      const existing = await prisma.card.findFirst({
        where: {
          userId: user.id,
          name: cardData.name,
        },
      });

      if (existing) {
        console.log(`  ⏭️  ${cardData.name} já existe`);
        skipped++;
        continue;
      }

      await prisma.card.create({
        data: {
          userId: user.id,
          name: cardData.name,
          bank: cardData.bank,
          limit: cardData.limit,
          isActive: true,
        },
      });

      console.log(`  ✅ ${cardData.name} criado (Limite: R$ ${cardData.limit})`);
      created++;
    }

    console.log('');
    console.log('📊 Resumo:');
    console.log(`   ✅ ${created} cartões criados`);
    if (skipped > 0) {
      console.log(`   ⏭️  ${skipped} cartões já existiam`);
    }
    console.log('');
    console.log('💡 Cartões criados:');
    cards.forEach((card) => {
      console.log(`   - ${card.name} (${card.bank}) - Limite: R$ ${card.limit}`);
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar cartões:', error.message || error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

createCards();

