const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        username: 'superadmin',
        email: 'admin@gmit.com',
        role: 'ADMIN',
        noWhatsapp: '081234567890',
      },
      {
        username: 'pendeta1',
        email: 'pendeta@gmit.com',
        role: 'PENDETA',
        noWhatsapp: '081234567891',
      },
      {
        username: 'majelis1',
        email: 'majelis@gmit.com',
        role: 'MAJELIS',
        noWhatsapp: '081234567892',
      },
      {
        username: 'pegawai1',
        email: 'pegawai@gmit.com',
        role: 'EMPLOYEE',
        noWhatsapp: '081234567893',
      },
      {
        username: 'jemaat1',
        email: 'jemaat@gmit.com',
        role: 'JEMAAT',
        noWhatsapp: '081234567894',
      },
    ];

    for (const user of users) {
      const upsertUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {}, // Jangan update kalau sudah ada
        create: {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          noWhatsapp: user.noWhatsapp,
          isActive: true,
        },
      });
      console.log(`✅ Created/Found user: ${user.role} - ${upsertUser.username}`);
    }

    console.log('🎉 Seeding finished.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
