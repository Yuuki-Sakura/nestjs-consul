import {
  ConsulKeyValueOptions,
  ConsulMetadataAccessor,
} from '@/consul-metadata.accessor';
import { InjectConsul } from '@/decorators';
import { setValue } from '@/utils/set-value';
import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import Consul from 'consul';

interface KeyValue {
  property: string;
  target: Object;
  type: Function;
  transformer?: <T>(value: any) => T;
  options: Consul.Kv.GetOptions;
  watcher?: Consul.Watch;
}

export interface ConsulKVResponse {
  LockIndex: number;
  Key: string;
  Flags: number;
  Value: string;
  CreateIndex: number;
  ModifyIndex: number;
}

@Injectable()
export class ConsulExplorer implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger('ConsulModule');
  private readonly keyValues = new Map<string, KeyValue>();

  @InjectConsul()
  private readonly consul: Consul.Consul;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ConsulMetadataAccessor,
  ) {}

  async onModuleInit() {
    this.explore();
    await this.handleKeyValues();
  }

  explore() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((wrapper: InstanceWrapper) => {
      const { metatype, instance } = wrapper;
      if (!metatype) return;
      const metadata = this.metadataAccessor.getKeyValueMetadata(metatype);
      if (metadata) {
        this.addKeyValues(instance, metadata);
      }
    });
  }

  addKeyValues(target: Object, keyValues: ConsulKeyValueOptions[]) {
    keyValues.forEach(({ options, property, type }) => {
      const key = `${target.constructor.name}__${property}`;
      this.keyValues.set(key, {
        options,
        target,
        property,
        type,
      });
    });
  }

  async handleKeyValues() {
    for (const item of this.keyValues.values()) {
      const { target, property, options, type, transformer } = item;
      try {
        const res = await this.consul.kv.get<ConsulKVResponse>(options);
        setValue(res.Value, target, property, type, transformer);
      } catch (e) {
        this.logger.error(`@KeyValue with given name ${options.key} error.`, e);
      }

      const watcher = this.consul.watch({
        method: this.consul.kv.get,
        options: { key: options.key },
      });
      watcher.on('change', (res: ConsulKVResponse) => {
        if (res) {
          setValue(res.Value, target, property, type, transformer);
        }
      });
      watcher.on('error', (e) =>
        this.logger.error(`@KeyValue with given name ${options.key} error.`, e),
      );
      item.watcher = watcher;
    }
  }

  onApplicationShutdown(signal?: string): any {
    this.keyValues.forEach((item) => item.watcher && item.watcher.end());
  }
}
