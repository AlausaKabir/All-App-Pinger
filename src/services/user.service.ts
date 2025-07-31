import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserRole, RoleChecker } from 'src/interfaces/role.interface';
import { UpdateUserRoleDto, GetUsersQueryDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private userRepository: UserRepository) {}

  async getAllUsers(filters?: GetUsersQueryDto) {
    try {
      this.logger.log(
        `Fetching all users with filters: ${JSON.stringify(filters)}`,
      );

      const users = await this.userRepository.getAllUsers(filters);

      this.logger.log(`Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(id: string) {
    try {
      this.logger.log(`Fetching user by ID: ${id}`);

      const user = await this.userRepository.getUserById(id);

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserRole(
    updateRoleDto: UpdateUserRoleDto,
    requestingUserId: string,
  ) {
    try {
      const { userId, role } = updateRoleDto;

      this.logger.log(
        `SuperAdmin ${requestingUserId} updating user ${userId} role to: ${role}`,
      );

      // Check if target user exists
      const targetUser = await this.userRepository.getUserById(userId);
      if (!targetUser) {
        this.logger.warn(`Target user not found: ${userId}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Prevent SuperAdmins from demoting themselves
      if (userId === requestingUserId && role !== UserRole.SUPERADMIN) {
        this.logger.warn(
          `SuperAdmin ${requestingUserId} attempted to demote themselves`,
        );
        throw new HttpException(
          'SuperAdmins cannot change their own role',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update the role
      const updatedUser = await this.userRepository.updateUserRole(
        userId,
        role,
      );

      this.logger.log(
        `Successfully updated user ${userId} role from ${targetUser.role} to ${role}`,
      );

      return {
        user: updatedUser,
        previousRole: targetUser.role,
        newRole: role,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to update user role: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserStats() {
    try {
      this.logger.log('Fetching user statistics');

      const stats = await this.userRepository.getUserStats();

      this.logger.log(`User stats retrieved: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to fetch user stats: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
