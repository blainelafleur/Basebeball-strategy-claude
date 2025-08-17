const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpdateUser() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: 'blainelafleur@yahoo.com'
      }
    });

    if (user) {
      console.log('User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      // Update to ADMIN role
      const updatedUser = await prisma.user.update({
        where: {
          email: 'blainelafleur@yahoo.com'
        },
        data: {
          role: 'ADMIN'
        }
      });

      console.log('User updated to ADMIN role:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } else {
      console.log('User not found. Creating new user with ADMIN role...');
      
      const newUser = await prisma.user.create({
        data: {
          email: 'blainelafleur@yahoo.com',
          name: 'Blaine LaFleur',
          role: 'ADMIN'
        }
      });

      console.log('New admin user created:', {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateUser();