import { prisma } from '../config/database';
import { disconnectDatabase } from '../config/database';
import { AccountType } from '../types/enums';

async function createAccounts() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('❌ Uso: pnpm create-accounts <email>');
    console.log('');
    console.log('Exemplo:');
    console.log('  pnpm create-accounts usuario@email.com');
    console.log('');
    console.log('Isso criará 3 contas:');
    console.log('  - {NomeUsuario}-Nu (Nubank)');
    console.log('  - {NomeUsuario}-Inter (Inter)');
    console.log('  - {NomeUsuario}-Pic (PicPay)');
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

    const accounts = [
      {
        name: `${username}-Nu`,
        type: AccountType.CHECKING,
        bank: 'Nubank',
      },
      {
        name: `${username}-Inter`,
        type: AccountType.CHECKING,
        bank: 'Inter',
      },
      {
        name: `${username}-Pic`,
        type: AccountType.CHECKING,
        bank: 'PicPay',
      },
    ];

    console.log('💳 Criando contas...');
    let created = 0;
    let skipped = 0;

    for (const accountData of accounts) {
      // Verificar se a conta já existe
      const existing = await prisma.account.findFirst({
        where: {
          userId: user.id,
          name: accountData.name,
        },
      });

      if (existing) {
        console.log(`  ⏭️  ${accountData.name} já existe`);
        skipped++;
        continue;
      }

      await prisma.account.create({
        data: {
          userId: user.id,
          name: accountData.name,
          type: accountData.type,
          balance: '0',
          currency: 'BRL',
        },
      });

      console.log(`  ✅ ${accountData.name} criada`);
      created++;
    }

    console.log('');
    console.log('📊 Resumo:');
    console.log(`   ✅ ${created} contas criadas`);
    if (skipped > 0) {
      console.log(`   ⏭️  ${skipped} contas já existiam`);
    }
    console.log('');
    console.log('💡 Contas criadas:');
    accounts.forEach((acc) => {
      console.log(`   - ${acc.name} (${acc.bank})`);
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar contas:', error.message || error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

createAccounts();

