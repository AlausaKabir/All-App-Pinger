import { HealthStatus } from '@prisma/client';

export interface IService {
  name: string;
  url: string;
  healthStatus?: HealthStatus;
}
