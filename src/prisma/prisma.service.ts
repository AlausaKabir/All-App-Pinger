import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log(`Prisma connected to DB`);

    // 🚀 Run database seeding after connection
    await this.seedDatabase();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log(`Prisma Database connection CLOSED`);
  }

  private async seedDatabase() {
    try {
      this.logger.log('🌱 Starting database seeding...');

      // 🔥 Seed SuperAdmin
      await this.seedSuperAdmin();

      // 🔥 Seed Default Notification Email
      await this.seedDefaultNotificationEmail();

      this.logger.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error.message);
      // Don't throw - let the app continue even if seeding fails
    }
  }

  private async seedSuperAdmin(): Promise<void> {
    const superAdminEmail = this.configService.get<string>('SUPERADMIN_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPERADMIN_PASSWORD',
    );
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;

    if (!superAdminEmail || !superAdminPassword) {
      this.logger.warn(
        '⚠️ SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not configured. Skipping SuperAdmin seeding.',
      );
      return;
    }

    const existingSuperAdmin = await this.user.findFirst({
      where: { role: UserRole.SUPERADMIN },
    });

    if (existingSuperAdmin) {
      this.logger.log('👤 SuperAdmin already exists - skipping seed');
      return;
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);

    await this.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: UserRole.SUPERADMIN,
      },
    });

    this.logger.log('✅ SuperAdmin seeded successfully!');
    this.logger.log(`📧 Email: ${superAdminEmail}`);
    this.logger.log(`🔑 Password: ${superAdminPassword}`);
    this.logger.warn(
      '⚠️  Please change the default password after first login!',
    );
  }

  private async seedDefaultNotificationEmail(): Promise<void> {
    const superAdminEmail = this.configService.get<string>('SUPERADMIN_EMAIL');

    if (!superAdminEmail) {
      this.logger.warn(
        '⚠️ SUPERADMIN_EMAIL not configured. Skipping notification email seeding.',
      );
      return;
    }

    const existingEmail = await this.email.findFirst();

    if (existingEmail) {
      this.logger.log('📧 Notification email already exists - skipping seed');
      return;
    }

    await this.email.create({
      data: {
        email: superAdminEmail,
        isActive: true,
      },
    });

    this.logger.log('✅ Default notification email seeded!');
  }
}
