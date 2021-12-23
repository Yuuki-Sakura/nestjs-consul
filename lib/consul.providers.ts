import { CONSUL_INTERNAL_OPTIONS, CONSUL_OPTIONS } from '@/consul.constants';
import {
  ConsulModuleAsyncOptions,
  ConsulModuleOptions,
} from '@/interfaces/consul-module-options.interface';
import { getIPAddress } from '@/utils/get-ip-address';
import { FactoryProvider, Provider } from '@nestjs/common';

export const createConsulOptions = (
  options: ConsulModuleOptions,
): ConsulModuleOptions => {
  const address = getIPAddress();
  return {
    config: {
      ...options.config,
    },
    service: {
      address: address,
      id: `${options.service.name}:${address}:${options.service.port}`,
      retryInterval: 5000,
      maxRetry: 5,
      ...options.service,
    },
    health: {
      interval: '10s',
      protocol: 'http',
      route: `${options.health.routePrefix}/consul/health-check`,
      ...options.health,
    },
  };
};

export const createOptionsProvider = (
  options: ConsulModuleOptions,
): FactoryProvider<ConsulModuleOptions> => {
  return {
    provide: CONSUL_OPTIONS,
    useFactory: (): ConsulModuleOptions => {
      return createConsulOptions(options);
    },
  };
};

export const createAsyncOptionsProvider = (
  options: ConsulModuleAsyncOptions,
): Provider => {
  return {
    provide: CONSUL_INTERNAL_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject,
  };
};

export const createAsyncProviders = (
  options: ConsulModuleAsyncOptions,
): Provider[] => {
  return [
    {
      provide: CONSUL_OPTIONS,
      useFactory: (config: ConsulModuleOptions): ConsulModuleOptions => {
        return createConsulOptions(config);
      },
      inject: [CONSUL_INTERNAL_OPTIONS],
    },
    createAsyncOptionsProvider(options),
  ];
};
