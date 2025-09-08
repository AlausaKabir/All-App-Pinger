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

      // 🔥 Seed SuperAdmin ONLY
      await this.seedSuperAdmin();

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
    const saltRoundsStr =
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10';
    const saltRounds = parseInt(saltRoundsStr, 10);

    if (!superAdminEmail || !superAdminPassword) {
      this.logger.warn(
        '⚠️ SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not configured. Skipping SuperAdmin seeding.',
      );
      return;
    }

    // 🔍 Debug logging
    this.logger.debug(
      `🔐 Salt rounds: ${saltRounds} (from env: ${saltRoundsStr})`,
    );

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
}
