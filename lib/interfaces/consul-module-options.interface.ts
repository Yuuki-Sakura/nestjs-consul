import { ModuleMetadata } from '@nestjs/common';
import Consul, { ConsulOptions } from 'consul';

export interface HealthCheck
  extends Omit<Consul.Agent.Service.RegisterCheck, 'http'> {
  route?: string;
  routePrefix?: string;
  protocol?: 'http' | 'https';
}

export interface ServiceOptions
  extends Omit<Consul.Agent.Service.RegisterOptions, 'check' | 'checks'> {
  port: number;
  retryInterval?: number;
  maxRetry?: number;
}

export interface ConsulModuleOptions {
  config: Omit<ConsulOptions, 'promisify'>;
  service: ServiceOptions;
  health: HealthCheck;
}

export interface ConsulModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => ConsulModuleOptions | Promise<ConsulModuleOptions>;
  inject?: any[];
  // use inside health check controller
  useCheckController?: boolean;
}
