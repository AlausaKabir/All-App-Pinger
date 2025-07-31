import {
  Body,
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/superadmin.guard';
import { UserService } from 'src/services/user.service';
import {
  UpdateUserRoleDto,
  GetUsersQueryDto,
  UserResponseDto,
} from 'src/dto/user.dto';
import { RolePermissions, UserRole } from 'src/interfaces/role.interface';

interface AuthenticatedRequest extends Request {
  user: any;
  permissions: RolePermissions;
}

@ApiTags('User Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users (SuperAdmin only)',
    description: 'Retrieve all users with optional filtering by role and email',
  })
  @ApiQuery({
    name: 'role',
    enum: UserRole,
    required: false,
    description: 'Filter users by role',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Search users by email',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllUsers(
    @Query() query: GetUsersQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      if (!req.permissions?.canManageUsers) {
        this.logger.error(
          `User ${req.user?.email} attempted to access user management without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(`SuperAdmin ${req.user.email} fetching all users`);
      const users = await this.userService.getAllUsers(query);

      return {
        statusCode: HttpStatus.OK,
        status: 'success',
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get users: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get user statistics (SuperAdmin only)',
    description: 'Get counts of users by role',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUserStats(@Request() req: AuthenticatedRequest) {
    try {
      if (!req.permissions?.canManageUsers) {
        this.logger.error(
          `User ${req.user?.email} attempted to access user stats without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(`SuperAdmin ${req.user.email} fetching user statistics`);
      const stats = await this.userService.getUserStats();

      return {
        statusCode: HttpStatus.OK,
        status: 'success',
        message: 'User statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get user stats: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (SuperAdmin only)',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUserById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      if (!req.permissions?.canManageUsers) {
        this.logger.error(
          `User ${req.user?.email} attempted to access user details without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(`SuperAdmin ${req.user.email} fetching user: ${id}`);
      const user = await this.userService.getUserById(id);

      return {
        statusCode: HttpStatus.OK,
        status: 'success',
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get user: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('role')
  @ApiOperation({
    summary: 'Update user role (SuperAdmin only)',
    description: "Change a user's role. SuperAdmins cannot demote themselves.",
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUserRole(
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      if (!req.permissions?.canManageUsers) {
        this.logger.error(
          `User ${req.user?.email} attempted to update user role without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(
        `SuperAdmin ${req.user.email} updating user ${updateRoleDto.userId} role to: ${updateRoleDto.role}`,
      );

      const result = await this.userService.updateUserRole(
        updateRoleDto,
        req.user.id,
      );

      this.logger.log(
        `Role update successful: ${updateRoleDto.userId} changed from ${result.previousRole} to ${result.newRole}`,
      );

      return {
        statusCode: HttpStatus.OK,
        status: 'success',
        message: `User role updated successfully from ${result.previousRole} to ${result.newRole}`,
        data: result,
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
}
