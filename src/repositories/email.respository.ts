import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailRepository {
  constructor(private prisma: PrismaService) {}

  async registerEmail(data: { email: string }) {
    const emailExists = await this.prisma.email.findFirst({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new HttpException('Email already exists', 400);
    }
    throw new HttpException('Something went wrong', 500);
  }

  async getNotificationEmail(): Promise<string> {
    const email = await this.prisma.email.findFirst();
    return email.email;
  }
}
