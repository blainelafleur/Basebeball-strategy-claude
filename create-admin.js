// Simple admin user creation script for Railway
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user for Railway...');

    const adminEmail = 'blainelafleur@yahoo.com';
    const adminPassword = 'Amanda11!';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log('✅ Admin user already exists, updating role...');
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log('✅ Admin role updated');
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Blaine LaFleur',
        role: 'ADMIN',
        passwordHash: hashedPassword,
      },
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', newUser.email);
    console.log('👤 Name:', newUser.name);
    console.log('🔰 Role:', newUser.role);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
