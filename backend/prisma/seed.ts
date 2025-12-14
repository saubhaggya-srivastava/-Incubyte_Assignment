import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sweetshop.com' },
    update: {},
    create: {
      email: 'admin@sweetshop.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@sweetshop.com' },
    update: {},
    create: {
      email: 'user@sweetshop.com',
      passwordHash: userPassword,
      role: 'user',
    },
  });
  console.log('✅ Regular user created:', user.email);

  // Create sample sweets
  const sweets = [
    {
      name: 'Milk Chocolate Bar',
      category: 'chocolate',
      price: 2.50,
      quantity: 100,
    },
    {
      name: 'Dark Chocolate Truffle',
      category: 'chocolate',
      price: 3.50,
      quantity: 50,
    },
    {
      name: 'Strawberry Gummy Bears',
      category: 'gummy',
      price: 1.50,
      quantity: 200,
    },
    {
      name: 'Sour Worms',
      category: 'gummy',
      price: 1.80,
      quantity: 150,
    },
    {
      name: 'Peppermint Candy',
      category: 'hard candy',
      price: 1.00,
      quantity: 300,
    },
    {
      name: 'Caramel Chews',
      category: 'caramel',
      price: 2.00,
      quantity: 120,
    },
    {
      name: 'Lollipops Assorted',
      category: 'lollipop',
      price: 0.80,
      quantity: 250,
    },
    {
      name: 'Chocolate Fudge',
      category: 'chocolate',
      price: 3.00,
      quantity: 75,
    },
  ];

  for (const sweet of sweets) {
    await prisma.sweet.upsert({
      where: { id: sweet.name }, // Using name as temporary unique identifier
      update: {},
      create: sweet,
    });
  }
  console.log(`✅ Created ${sweets.length} sample sweets`);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
