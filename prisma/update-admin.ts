import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminUser() {
  console.log('🔧 Creating/updating admin user for Railway deployment...');

  try {
    const adminEmail = 'blainelafleur@yahoo.com';
    const adminPassword = 'Amanda11!';

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.email);
      console.log('📊 Current role:', existingUser.role);

      // Update the user to ADMIN role while preserving everything else
      const updatedUser = await prisma.user.update({
        where: {
          email: adminEmail,
        },
        data: {
          role: 'ADMIN',
        },
      });

      console.log('🎉 User updated successfully!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Name:', updatedUser.name);
      console.log('🔰 New Role:', updatedUser.role);
      console.log('🔒 Password preserved:', !!updatedUser.passwordHash);

      return updatedUser;
    } else {
      console.log('⚠️  User not found. Creating new admin user...');

      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create the admin user
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
      console.log('🔒 Password set for:', adminPassword);

      return newUser;
    }
  } catch (error) {
    console.error('❌ Error creating/updating admin user:', error);
    // Don't throw error - let deployment continue
    return null;
  }
}

export { updateAdminUser };

// If this script is run directly (not imported)
if (require.main === module) {
  updateAdminUser()
    .then(() => {
      console.log('✅ Admin update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin update failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
