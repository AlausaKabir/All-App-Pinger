import { ConflictException, Injectable } from '@nestjs/common';
import { HealthStatus, Service } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async getServices(): Promise<Service[]> {
    return this.prisma.service.findMany();
  }

  async getServiceByUrl(url: string): Promise<Service> {
    const service = await this.prisma.service.findFirst({
      where: { url },
    });

    if (!service) {
      throw new Error(`Service with URL ${url} not found`);
    }
    return service;
  }

  async addService(data: {
    name: string;
    url: string;
    healthStatus: HealthStatus;
  }): Promise<Service> {
    const existingService = await this.prisma.service.findFirst({
      where: { url: data.url },
    });

    if (existingService) {
      throw new ConflictException('Service already exists');
    }
    return this.prisma.service.create({
      data,
    });
  }
}
