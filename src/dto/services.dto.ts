import { ApiProperty } from '@nestjs/swagger';
import { HealthStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Service Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'http://service-url.com' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(HealthStatus)
  @IsOptional()
  healthStatus: HealthStatus;
}
