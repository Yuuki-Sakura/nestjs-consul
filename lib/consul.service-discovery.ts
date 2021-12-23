import { InjectConsul } from '@/decorators/consul.decorator';
import {
  ConsulNodesResponse,
  ServiceNode,
} from '@/interfaces/service-discovery.interface';
import { getServiceNodes } from '@/utils/get-service-nodes';
import { Injectable } from '@nestjs/common';
import { Consul, Watch } from 'consul';

@Injectable()
export class ConsulServiceDiscovery {
  private readonly services = new Map<string, ServiceNode[]>();
  private readonly watchers = new Map<string, Watch>();
  private serviceWatcher: Watch;
  private readonly nodesListeners = new Map<
    string,
    ((nodes: ServiceNode[]) => void)[]
  >();
  private readonly serviceHandlers: ((services: string[]) => void)[] = [];

  constructor(
    @InjectConsul()
    private readonly consul: Consul,
  ) {
    this.init();
  }

  private async init() {
    let services = Object.keys(await this.consul.catalog.service.list());
    services = services.filter((service) => service !== 'consul');
    await this.initServices(services);
    this.createServicesWatcher();
  }

  private async initServices(services: string[]) {
    await Promise.all(
      services.map(async (service) => {
        const nodes = await this.consul.health.service<ConsulNodesResponse[]>(
          service,
        );
        const serviceNodes = getServiceNodes(nodes);
        this.services.set(service, serviceNodes);
        this.triggerNodesChange(service, serviceNodes);
        this.createServiceNodesWatcher(service);
      }),
    );
  }

  private createServicesWatcher() {
    this.serviceWatcher?.end();
    const watcher = this.consul.watch({
      method: this.consul.catalog.service.list,
    });
    watcher.on('change', async (services) => {
      if (services) {
        services = services.filter((service) => service !== 'consul');
        await this.initServices(services);
        this.triggerServicesChange(services);
      }
    });
    this.serviceWatcher = watcher;
  }

  private createServiceNodesWatcher(service: string) {
    this.watchers.get(service)?.end();
    const watcher = this.consul.watch({
      method: this.consul.health.service,
      options: { key: service },
    });
    watcher.on('change', (res: ConsulNodesResponse[]) => {
      if (res) {
        const serviceNodes = getServiceNodes(res);
        this.services.set(service, serviceNodes);
        this.triggerNodesChange(service, serviceNodes);
      }
    });
    this.watchers.set(service, watcher);
  }

  private triggerServicesChange(services: string[]) {
    this.serviceHandlers.forEach((handler) => handler(services));
  }

  private triggerNodesChange(service: string, nodes: ServiceNode[]) {
    this.nodesListeners.get(service).forEach((handler) => handler(nodes));
  }

  public getServices() {
    return this.services;
  }

  public watchServices(handler: (services: string[]) => void) {
    this.serviceHandlers.push(handler);
  }

  public unwatchServices(handler: (services: string[]) => void) {
    const handlers = this.serviceHandlers;
    const index = handlers.indexOf(handler);
    if (index == -1) {
      return;
    }
    handlers.splice(index, 1);
  }

  public watchNodes(service: string, handler: (nodes: ServiceNode[]) => void) {
    const handlers = this.nodesListeners.get(service);
    if (handlers) {
      handlers.push(handler);
      this.nodesListeners.set(service, handlers);
    } else {
      this.nodesListeners.set(service, [handler]);
    }
  }

  public unwatchNodes(
    service: string,
    handler: (nodes: ServiceNode[]) => void,
  ) {
    const handlers = this.nodesListeners.get(service);
    if (!handlers) {
      return;
    }
    const index = handlers.indexOf(handler);
    if (index == -1) {
      return;
    }
    handlers.splice(index, 1);
    this.nodesListeners.set(service, handlers);
  }
}
