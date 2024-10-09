import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    const databaseUrl = isProduction
      ? configService.get<string>('PROD_DATABASE_URL')
      : configService.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log(`Database connection established`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log(`Database connection closed`);
  }
}
