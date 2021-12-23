import { ConsulMetadataAccessor } from '@/consul-metadata.accessor';
import { CONSUL_CLIENT, CONSUL_OPTIONS } from '@/consul.constants';
import { ConsulExplorer } from '@/consul.explorer';
import { InjectConsul } from '@/decorators/consul.decorator';
import {
  createAsyncProviders,
  createOptionsProvider,
} from '@/consul.providers';
import { ConsulService } from '@/consul.service';
import { HealthCheckController } from '@/health-check.controller';
import {
  ConsulModuleAsyncOptions,
  ConsulModuleOptions,
} from '@/interfaces/consul-module-options.interface';
import { DynamicModule, FactoryProvider, Inject, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import * as Consul from 'consul';
type IConsul = Consul.Consul;

@Module({})
export class ConsulModule {
  @InjectConsul()
  private readonly consul: IConsul;

  @Inject(CONSUL_OPTIONS)
  private readonly options: ConsulModuleOptions;

  static forRoot(options: ConsulModuleOptions): DynamicModule {
    const consulOptionsProvider = createOptionsProvider(options);
    const consulProvider: FactoryProvider<IConsul> = {
      provide: CONSUL_CLIENT,
      useFactory(options: ConsulModuleOptions): IConsul {
        return new Consul({ ...options.config, promisify: true });
      },
      inject: [CONSUL_OPTIONS],
    };
    const controllers = options.health.route ? [] : [HealthCheckController];

    return {
      global: true,
      module: ConsulModule,
      imports: [DiscoveryModule],
      providers: [
        consulOptionsProvider,
        consulProvider,
        ConsulService,
        ConsulExplorer,
        ConsulMetadataAccessor,
      ],
      exports: [consulProvider, ConsulService],
      controllers,
    };
  }

  static forRootAsync(options: ConsulModuleAsyncOptions): DynamicModule {
    const consulProvider: FactoryProvider<IConsul> = {
      provide: CONSUL_CLIENT,
      useFactory(options: ConsulModuleOptions): IConsul {
        return new Consul({ ...options.config, promisify: true });
      },
      inject: [CONSUL_OPTIONS],
    };
    const controllers = !options.useCheckController
      ? []
      : [HealthCheckController];

    return {
      global: true,
      module: ConsulModule,
      imports: [DiscoveryModule],
      providers: [
        ...createAsyncProviders(options),
        consulProvider,
        ConsulService,
        ConsulExplorer,
        ConsulMetadataAccessor,
      ],
      exports: [consulProvider, ConsulService],
      controllers,
    };
  }
}
