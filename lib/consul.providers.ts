import { CONSUL_OPTIONS } from '@/consul.constants';
import { ConsulModuleOptions } from '@/interfaces/consul-module-options.interface';
import { getIPAddress } from '@/utils/get-ip-address';
import { FactoryProvider } from '@nestjs/common';
import { ModuleRef } from "@nestjs/core";
import * as crypto from 'crypto';

export const createOptionsProvider = (
  options: ConsulModuleOptions,
): FactoryProvider<ConsulModuleOptions> => {
  return {
    provide: CONSUL_OPTIONS,
    useFactory: (ref: ModuleRef): ConsulModuleOptions => {
      const address = getIPAddress();
      return {
        config: {
          ...options.config,
        },
        service: {
          address: address,
          id: crypto
            .createHash('md5')
            .update(
              `${address}:${options.service.port}-${options.service.name}`,
            )
            .digest('hex'),
          retryInterval: 5000,
          maxRetry: 5,
          ...options.service,
        },
        health: {
          interval: '10s',
          protocol: 'http',
          ...options.health,
        },
      };
    },
    inject: [ModuleRef],
  };
};
