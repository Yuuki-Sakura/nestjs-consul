import Consul, { ConsulOptions } from 'consul';

export interface HealthCheck
  extends Omit<Consul.Agent.Service.RegisterCheck, 'http'> {
  route: string;
  protocol?: 'http' | 'https';
}

export interface ServiceOptions
  extends Omit<Consul.Agent.Service.RegisterOptions, 'check' | 'checks'> {
  retryInterval?: number;
  maxRetry?: number;
}

export interface ConsulModuleOptions {
  config: Omit<ConsulOptions, 'promisify'>;
  service: ServiceOptions;
  health: HealthCheck;
}
