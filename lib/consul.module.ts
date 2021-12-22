import { CONSUL_CLIENT, CONSUL_OPTIONS } from '@/consul.constants';
import { InjectConsul } from '@/consul.decorator';
import { createOptionsProvider } from '@/consul.providers';
import { ConsulService } from '@/consul.service';
import { ConsulModuleOptions } from '@/interfaces/consul-module-options.interface';
import {
  DynamicModule,
  FactoryProvider,
  Inject,
  Logger,
  Module,
} from '@nestjs/common';
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

    return {
      global: true,
      module: ConsulModule,
      providers: [consulOptionsProvider, consulProvider, ConsulService],
      exports: [consulProvider, ConsulService],
    };
  }
}
