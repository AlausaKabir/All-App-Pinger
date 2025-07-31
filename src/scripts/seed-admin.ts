import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../interfaces/role.interface';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seeding...\n');

    const adminEmail = 'admin@pinger.com';
    const superAdminEmail = 'superadmin@pinger.com';
    const defaultPassword = 'Pinger123!';

    // Create SuperAdmin
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const superAdmin = await prisma.user.create({
        data: {
          email: superAdminEmail,
          password: hashedPassword,
          role: UserRole.SUPERADMIN,
        },
      });

      console.log('✅ SuperAdmin user created:');
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   ID: ${superAdmin.id}\n`);
    } else {
      console.log('ℹ️  SuperAdmin already exists\n');
    }

    // Create Admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      console.log('✅ Admin user created:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}\n`);
    } else {
      console.log('ℹ️  Admin already exists\n');
    }

    // Create regular user for testing
    const userEmail = 'user@pinger.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const user = await prisma.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          role: UserRole.USER,
        },
      });

      console.log('✅ Test user created:');
      console.log(`   Email: ${userEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}\n`);
    } else {
      console.log('ℹ️  Test user already exists\n');
    }

    console.log('🔐 Default credentials summary:');
    console.log('═══════════════════════════════════════');
    console.log(`📧 SuperAdmin: ${superAdminEmail}`);
    console.log(`📧 Admin: ${adminEmail}`);
    console.log(`📧 User: ${userEmail}`);
    console.log(`🔑 Password (all): ${defaultPassword}`);
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change passwords in production!');
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🎯 Seeding completed!');
  }
}

// Run the seeder
if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
