import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { UserRole } from 'src/interfaces/role.interface';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'User ID to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole, { message: 'Role must be USER, ADMIN, or SUPERADMIN' })
  role: UserRole;
}

export class GetUsersQueryDto {
  @ApiProperty({
    description: 'Filter by role',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Search by email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
