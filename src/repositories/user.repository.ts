import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/interfaces/role.interface';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private prisma: PrismaService) {}

  async getAllUsers(filters?: { role?: UserRole; email?: string }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    this.logger.log(`Fetching users with filters: ${JSON.stringify(filters)}`);

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserById(id: string) {
    this.logger.log(`Fetching user by ID: ${id}`);

    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    this.logger.log(`Updating user ${userId} role to: ${newRole}`);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserStats() {
    this.logger.log('Fetching user statistics');

    const [totalUsers, adminCount, superAdminCount, userCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        this.prisma.user.count({ where: { role: UserRole.SUPERADMIN } }),
        this.prisma.user.count({ where: { role: UserRole.USER } }),
      ]);

    return {
      totalUsers,
      adminCount,
      superAdminCount,
      userCount,
    };
  }
}
