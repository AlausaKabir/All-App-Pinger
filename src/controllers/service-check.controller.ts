import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateServiceDto } from 'src/dto/services.dto';
import { ServiceCheckService } from 'src/services/serviceCheck.service';

@ApiTags('Services')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('service-check')
export class ServiceCheckController {
  private readonly logger = new Logger(ServiceCheckController.name);
  constructor(private readonly serviceCheckService: ServiceCheckService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new service' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service registered successfully' })
  async registerService(@Body() createServiceDto: CreateServiceDto) {
    try {
      return this.serviceCheckService.registerService(createServiceDto);
    } catch (error) {
      this.logger.error(`Error registering service: ${error.message}`);
    }
  }

  @Get('services')
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  async getAllServices() {
    try {
      return this.serviceCheckService.getAllServices();
    } catch (error) {
      this.logger.error(`Error retrieving services: ${error.message}`);
    }
  }
}
