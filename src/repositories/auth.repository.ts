import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
