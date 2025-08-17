import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('🔧 Initializing admin user...');

    const adminEmail = 'blainelafleur@yahoo.com';
    const adminPassword = 'Amanda11!';

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log('✅ Admin user exists, ensuring ADMIN role...');

      if (existingUser.role !== 'ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' },
        });

        return NextResponse.json({
          success: true,
          message: 'Admin user role updated to ADMIN',
          user: {
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user already exists with ADMIN role',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      });
    }

    // Create new admin user
    console.log('🎯 Creating new admin user...');
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

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    });
  } catch (error) {
    console.error('❌ Error creating admin user:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create admin user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
