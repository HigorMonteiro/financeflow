import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Categorias iniciais com ícones e cores
const defaultCategories = [
  {
    name: 'Moradia',
    type: 'EXPENSE',
    color: '#8B5CF6', // Roxo
    icon: 'Home',
  },
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    color: '#F59E0B', // Laranja
    icon: 'UtensilsCrossed',
  },
  {
    name: 'Saúde',
    type: 'EXPENSE',
    color: '#EF4444', // Vermelho
    icon: 'Heart',
  },
  {
    name: 'Educação',
    type: 'EXPENSE',
    color: '#3B82F6', // Azul
    icon: 'GraduationCap',
  },
  {
    name: 'Despesas Pessoais',
    type: 'EXPENSE',
    color: '#EC4899', // Rosa
    icon: 'User',
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    color: '#10B981', // Verde
    icon: 'Car',
  },
  {
    name: 'Celular/TV/Internet',
    type: 'EXPENSE',
    color: '#6366F1', // Índigo
    icon: 'Wifi',
  },
  {
    name: 'Lazer',
    type: 'EXPENSE',
    color: '#14B8A6', // Ciano
    icon: 'Gamepad2',
  },
];

async function main() {
  const defaultEmail = process.env.SEED_EMAIL || 'admin@financeflow.com';
  const defaultPassword = process.env.SEED_PASSWORD || 'admin123';
  const defaultName = process.env.SEED_NAME || 'Admin User';

  console.log('🌱 Iniciando seed do banco de dados...');

  // Buscar ou criar usuário
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
      },
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nome: ${user.name}`);
    console.log(`🔑 Senha: ${defaultPassword}`);
  } else {
    console.log(`⚠️  Usuário com email ${defaultEmail} já existe.`);
  }

  // Criar categorias padrão do sistema (sem userId, isDefault = true)
  console.log('\n📁 Criando categorias padrão do sistema...');
  let categoriesCreated = 0;
  let categoriesSkipped = 0;

  for (const categoryData of defaultCategories) {
    // Verificar se já existe uma categoria padrão com este nome
    const existingDefaultCategory = await prisma.category.findFirst({
      where: {
        isDefault: true,
        name: categoryData.name,
      },
    });

    if (!existingDefaultCategory) {
      await prisma.category.create({
        data: {
          userId: null, // Categoria padrão não pertence a nenhum usuário específico
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          icon: categoryData.icon,
          isDefault: true, // Marcar como categoria padrão
        },
      });
      categoriesCreated++;
      console.log(`  ✅ ${categoryData.name} (${categoryData.icon}) - Categoria padrão`);
    } else {
      categoriesSkipped++;
      console.log(`  ⏭️  ${categoryData.name} já existe como categoria padrão`);
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ ${categoriesCreated} categorias criadas`);
  if (categoriesSkipped > 0) {
    console.log(`   ⏭️  ${categoriesSkipped} categorias já existiam`);
  }

  console.log('\n💡 Você pode alterar as credenciais usando variáveis de ambiente:');
  console.log('   SEED_EMAIL=seu@email.com');
  console.log('   SEED_PASSWORD=suasenha');
  console.log('   SEED_NAME=Seu Nome');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

