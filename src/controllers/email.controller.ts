import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { RegisterEmailDto } from 'src/dto/email.dto';
import { EmailService } from 'src/services/email.service';
import { RolePermissions } from 'src/interfaces/role.interface';

interface AuthenticatedRequest extends Request {
  user: any;
  permissions: RolePermissions;
}

@ApiTags('Email')
@ApiBearerAuth('JWT-auth')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Register an email (Admin only)' })
  @ApiBody({ type: RegisterEmailDto })
  @ApiResponse({ status: 201, description: 'Email registered successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async registerEmail(
    @Body() registerEmailDto: RegisterEmailDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      // 🔥 Clean permission check
      if (!req.permissions?.canManageEmails) {
        this.logger.error(
          `User ${req.user?.email || 'unknown'} attempted to register email without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(
        `Admin ${req.user?.email} registering notification email: ${registerEmailDto.email}`,
      );
      const result = await this.emailService.registerEmail(registerEmailDto);

      return {
        statusCode: HttpStatus.CREATED,
        status: 'success',
        message: 'Email registered for notifications successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to register email: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('notification-email')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get notification emails (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Notification emails retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNotificationEmail(@Request() req: AuthenticatedRequest) {
    try {
      if (!req.permissions?.canManageEmails) {
        this.logger.error(
          `User ${req.user?.email || 'unknown'} attempted to view emails without permission`,
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = await this.emailService.getNotificationEmail();

      return {
        statusCode: HttpStatus.OK,
        status: 'success',
        message: 'Notification emails retrieved successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get notification emails: ${error.message}`);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
