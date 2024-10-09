import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterEmailDto } from 'src/dto/email.dto';
import { EmailService } from 'src/services/email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register an email' })
  @ApiBody({ type: RegisterEmailDto })
  @ApiResponse({ status: 201, description: 'Email registered successfully' })
  async registerEmail(@Body() registerEmailDto: RegisterEmailDto) {
    return this.emailService.registerEmail(registerEmailDto);
  }

  @Get('notification-email')
  @ApiOperation({ summary: 'Get notification email' })
  @ApiResponse({
    status: 200,
    description: 'Notification email retrieved successfully',
  })
  async getNotificationEmail() {
    return this.emailService.getNotificationEmail();
  }
}
