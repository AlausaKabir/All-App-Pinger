import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
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
import { HttpStatusCode } from 'axios';
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
      if (error.message === 'Service already exists') {
        throw new HttpException(
          'Service already exists',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'Failed to register service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteService(@Param('id') id: string) {
    try {
      const result = this.serviceCheckService.deleteService(id);
      if (!result) {
        throw new NotFoundException('Service not found');
      }
      this.logger.log(`Service with ID ${id} deleted successfully`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Service deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting service: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete service');
    }
  }
}
