import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestUser() {
  console.log('🌱 Criando usuário de teste com dados fictícios...\n');

  // 1. CRIAR USUÁRIO
  console.log('👤 Criando usuário...');
  const user = await prisma.user.upsert({
    where: { email: 'teste@financeflow.com' },
    update: {},
    create: {
      email: 'teste@financeflow.com',
      name: 'João da Silva',
      password: await bcrypt.hash('teste123', 10),
      itemsPerPage: 50,
    },
  });
  console.log(`   ✅ ${user.name} (${user.email})`);

  // 2. CRIAR CONTAS
  console.log('\n💰 Criando contas...');
  const contaCorrente = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Conta Corrente Nubank',
      type: 'CHECKING',
      balance: '5430.50',
      currency: 'BRL',
      color: '#8A05BE',
    },
  });
  console.log(`   ✅ ${contaCorrente.name} - R$ ${contaCorrente.balance}`);

  const contaPoupanca = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Poupança Inter',
      type: 'SAVINGS',
      balance: '12500.00',
      currency: 'BRL',
      color: '#FF7A00',
    },
  });
  console.log(`   ✅ ${contaPoupanca.name} - R$ ${contaPoupanca.balance}`);

  const contaInvestimento = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Investimentos XP',
      type: 'INVESTMENT',
      balance: '25000.00',
      currency: 'BRL',
      color: '#000000',
    },
  });
  console.log(`   ✅ ${contaInvestimento.name} - R$ ${contaInvestimento.balance}`);

  // 3. CRIAR CARTÕES DE CRÉDITO
  console.log('\n💳 Criando cartões de crédito...');
  const cartaoNubank = await prisma.card.create({
    data: {
      userId: user.id,
      name: 'Nubank Roxinho',
      bank: 'NUBANK',
      lastFourDigits: '4521',
      limit: '8000.00',
      closingDay: 15,
      dueDay: 25,
      bestPurchaseDay: 16,
      isActive: true,
    },
  });
  console.log(`   ✅ ${cartaoNubank.name} - Limite R$ ${cartaoNubank.limit}`);

  const cartaoInter = await prisma.card.create({
    data: {
      userId: user.id,
      name: 'Inter Gold',
      bank: 'INTER',
      lastFourDigits: '7892',
      limit: '5000.00',
      closingDay: 10,
      dueDay: 20,
      bestPurchaseDay: 11,
      isActive: true,
    },
  });
  console.log(`   ✅ ${cartaoInter.name} - Limite R$ ${cartaoInter.limit}`);

  // 4. BUSCAR CATEGORIAS PADRÃO
  console.log('\n📁 Buscando categorias padrão...');
  const categorias = await prisma.category.findMany({
    where: { isDefault: true },
  });
  console.log(`   ✅ ${categorias.length} categorias encontradas`);

  // Mapear categorias por nome para facilitar
  const catMap = Object.fromEntries(
    categorias.map(cat => [cat.name, cat])
  );

  // 5. CRIAR TRANSAÇÕES VARIADAS
  console.log('\n💸 Criando transações...');
  
  const hoje = new Date();
  const umMesAtras = new Date(hoje);
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);

  // Receita - Salário
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: categorias[0].id, // Usar primeira categoria disponível
      amount: '6500.00',
      type: 'INCOME',
      description: 'Salário Dezembro',
      date: new Date('2024-12-05'),
      tags: '["salario", "mensal"]',
    },
  });
  console.log('   ✅ Receita: Salário R$ 6.500,00');

  // Despesa - Aluguel (recorrente)
  const transAluguel = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: catMap['Moradia']?.id || categorias[0].id,
      amount: '1800.00',
      type: 'EXPENSE',
      description: 'Aluguel',
      date: new Date('2024-12-10'),
      isRecurring: true,
      tags: '["fixo", "mensal"]',
    },
  });
  
  await prisma.recurringTransaction.create({
    data: {
      transactionId: transAluguel.id,
      frequency: 'MONTHLY',
      nextDueDate: new Date('2025-01-10'),
    },
  });
  console.log('   ✅ Despesa Recorrente: Aluguel R$ 1.800,00');

  // Despesa - Mercado
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: catMap['Alimentação']?.id || categorias[1].id,
      amount: '850.30',
      type: 'EXPENSE',
      description: 'Supermercado Carrefour',
      date: new Date('2024-12-15'),
      tags: '["alimentacao", "mercado"]',
    },
  });
  console.log('   ✅ Despesa: Mercado R$ 850,30');

  // Despesa Parcelada - Notebook (cartão)
  for (let i = 1; i <= 10; i++) {
    const dataTransacao = new Date('2024-12-20');
    dataTransacao.setMonth(dataTransacao.getMonth() + (i - 1));

    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: contaCorrente.id,
        cardId: cartaoNubank.id,
        categoryId: catMap['Despesas Pessoais']?.id || categorias[2].id,
        amount: '320.00',
        type: 'EXPENSE',
        description: `Notebook Dell - Parcela ${i}/10`,
        date: dataTransacao,
        installmentNumber: i,
        installmentTotal: 10,
        tags: '["parcelado", "eletronicos"]',
      },
    });
  }
  console.log('   ✅ Despesa Parcelada: Notebook 10x R$ 320,00');

  // Despesa - Uber
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: catMap['Transporte']?.id || categorias[3].id,
      amount: '45.80',
      type: 'EXPENSE',
      description: 'Uber - Casa até trabalho',
      date: new Date('2024-12-18'),
      tags: '["transporte", "uber"]',
    },
  });
  console.log('   ✅ Despesa: Uber R$ 45,80');

  // Despesa - Academia (recorrente)
  const transAcademia = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      cardId: cartaoInter.id,
      categoryId: catMap['Saúde']?.id || categorias[4].id,
      amount: '89.90',
      type: 'EXPENSE',
      description: 'Academia SmartFit',
      date: new Date('2024-12-12'),
      isRecurring: true,
      tags: '["saude", "academia"]',
    },
  });

  await prisma.recurringTransaction.create({
    data: {
      transactionId: transAcademia.id,
      frequency: 'MONTHLY',
      nextDueDate: new Date('2025-01-12'),
    },
  });
  console.log('   ✅ Despesa Recorrente: Academia R$ 89,90');

  // Despesa - Netflix
  const transNetflix = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      cardId: cartaoNubank.id,
      categoryId: catMap['Lazer']?.id || categorias[5].id,
      amount: '55.90',
      type: 'EXPENSE',
      description: 'Netflix Premium',
      date: new Date('2024-12-08'),
      isRecurring: true,
      tags: '["streaming", "entretenimento"]',
    },
  });

  await prisma.recurringTransaction.create({
    data: {
      transactionId: transNetflix.id,
      frequency: 'MONTHLY',
      nextDueDate: new Date('2025-01-08'),
    },
  });
  console.log('   ✅ Despesa Recorrente: Netflix R$ 55,90');

  // Receita extra - Freela
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: categorias[0].id,
      amount: '1500.00',
      type: 'INCOME',
      description: 'Freela desenvolvimento web',
      date: new Date('2024-12-22'),
      tags: '["freela", "extra"]',
    },
  });
  console.log('   ✅ Receita Extra: Freela R$ 1.500,00');

  console.log('\n   📊 Total: 18 transações criadas');

  // 6. CRIAR METAS FINANCEIRAS
  console.log('\n🎯 Criando metas financeiras...');
  
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Reserva de Emergência',
      type: 'EMERGENCY_FUND',
      targetAmount: '30000.00',
      currentAmount: '12500.00',
      deadline: new Date('2025-12-31'),
    },
  });
  console.log('   ✅ Reserva de Emergência: R$ 30.000,00');

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Viagem para Europa',
      type: 'TRAVEL',
      targetAmount: '15000.00',
      currentAmount: '3200.00',
      deadline: new Date('2025-07-01'),
    },
  });
  console.log('   ✅ Viagem Europa: R$ 15.000,00');

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Comprar Carro',
      type: 'PURCHASE',
      targetAmount: '50000.00',
      currentAmount: '8500.00',
      deadline: new Date('2026-06-30'),
    },
  });
  console.log('   ✅ Carro: R$ 50.000,00');

  // 7. CRIAR ORÇAMENTOS
  console.log('\n📊 Criando orçamentos mensais...');
  
  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: catMap['Alimentação']?.id || categorias[1].id,
      amount: '1000.00',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    },
  });
  console.log('   ✅ Alimentação: R$ 1.000,00/mês');

  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: catMap['Transporte']?.id || categorias[3].id,
      amount: '500.00',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    },
  });
  console.log('   ✅ Transporte: R$ 500,00/mês');

  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: catMap['Lazer']?.id || categorias[5].id,
      amount: '800.00',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    },
  });
  console.log('   ✅ Lazer: R$ 800,00/mês');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('   • 1 usuário');
  console.log('   • 3 contas bancárias');
  console.log('   • 2 cartões de crédito');
  console.log('   • 18 transações (receitas, despesas, parceladas, recorrentes)');
  console.log('   • 3 metas financeiras');
  console.log('   • 3 orçamentos mensais');
  console.log('\n🔐 Credenciais:');
  console.log('   Email: teste@financeflow.com');
  console.log('   Senha: teste123');
}

seedTestUser()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });