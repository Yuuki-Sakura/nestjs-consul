import { CONSUL_OPTIONS } from '@/consul.constants';
import { InjectConsul } from '@/decorators/consul.decorator';
import { ConsulModuleOptions } from '@/interfaces/consul-module-options.interface';
import { sleep } from '@/utils/sleep';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import * as Consul from 'consul';
type IConsul = Consul.Consul;

@Injectable()
export class ConsulService implements OnApplicationBootstrap, OnModuleDestroy {
  @InjectConsul()
  private readonly consul: IConsul;

  @Inject(CONSUL_OPTIONS)
  private readonly options: ConsulModuleOptions;

  private _service: Consul.Agent.Service.RegisterOptions;

  private readonly logger = new Logger('ConsulModule');

  private createService(): Consul.Agent.Service.RegisterOptions {
    const health = this.options.health;
    const { address, port } = this.options.service;
    const { script, interval, ttl, notes, status } = health;
    const check: Consul.Agent.Service.RegisterCheck = {
      script,
      interval,
      ttl,
      notes,
      status,
      http: `${health.protocol}://${address}:${port}${health.route}`,
    };
    return {
      ...this.options.service,
      check,
    };
  }

  private async registerService() {
    const service = this.createService();
    this._service = service;
    const { maxRetry, retryInterval } = this.options.service;
    let count = 0;
    while (true) {
      try {
        await this.consul.agent.service.register(service);
        this.logger.log(`Register service ${service.name} success.`);
        break;
      } catch (e) {
        if (
          typeof maxRetry == 'number' &&
          maxRetry !== -1 &&
          count++ > maxRetry
        ) {
          this.logger.error(`Register service ${service.name} fail`, e);
          break;
        }
        this.logger.warn(
          `Register service ${service.name} fail, retrying...`,
          e,
        );
        await sleep(retryInterval);
      }
    }
  }

  async deregisterService() {
    const service = this._service;
    const { maxRetry, retryInterval } = this.options.service;
    let count = 0;
    while (true) {
      try {
        await this.consul.agent.service.deregister(service.id);
        this.logger.log(`Deregister service ${service.name} success.`);
        break;
      } catch (e) {
        if (
          typeof maxRetry == 'number' &&
          maxRetry !== -1 &&
          count++ > maxRetry
        ) {
          this.logger.error(`Deregister service ${service.name} fail`, e);
          break;
        }
        this.logger.warn(
          `Deregister service ${service.name} fail, retrying...`,
          e,
        );
        await sleep(retryInterval);
      }
    }
  }

  async onApplicationBootstrap() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }
}
