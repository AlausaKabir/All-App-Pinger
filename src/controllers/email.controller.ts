import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RegisterEmailDto } from 'src/dto/email.dto';
import { EmailService } from 'src/services/email.service';

@ApiTags('Email')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register an email' })
  @ApiBody({ type: RegisterEmailDto })
  @ApiResponse({ status: 201, description: 'Email registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  async registerEmail(@Body() registerEmailDto: RegisterEmailDto) {
    try {
      const result = this.emailService.registerEmail(registerEmailDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Email registered successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error registering email: ${error.message}`);
      if (error.message === 'Email already exists') {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('notification-email')
  @ApiOperation({ summary: 'Get notification email' })
  @ApiResponse({
    status: 200,
    description: 'Notification email retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No email found' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  async getNotificationEmail() {
    try {
      const result = this.emailService.getNotificationEmail();

      return {
        statusCode: HttpStatus.OK,
        message: 'Notification email retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving notification email: ${error.message}`,
      );
      if (error.message === 'No email found') {
        throw new HttpException('No email found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
