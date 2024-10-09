import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateServiceDto } from 'src/dto/services.dto';
import { ServiceCheckService } from 'src/services/serviceCheck.service';

@ApiTags('Services')
@Controller('service-check')
export class ServiceCheckController {
  constructor(private readonly serviceCheckService: ServiceCheckService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new service' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service registered successfully' })
  async registerService(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceCheckService.registerService(createServiceDto);
  }
}
