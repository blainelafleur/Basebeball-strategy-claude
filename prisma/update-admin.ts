import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminUser() {
  console.log('🔧 Updating admin user for Railway deployment...');

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'blainelafleur@yahoo.com',
      },
    });

    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.email);
      console.log('📊 Current role:', existingUser.role);

      // Update the user to ADMIN role while preserving everything else
      const updatedUser = await prisma.user.update({
        where: {
          email: 'blainelafleur@yahoo.com',
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
      console.log('⚠️  User not found. This is expected on first deployment.');
      console.log('💡 User will be created when they first sign up.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
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
