import { CONSUL_KEY_VALUE } from '@/consul.constants';
import { Injectable } from '@nestjs/common';
import Consul from 'consul';

export type ConsulKeyValueOptions = {
  options: Consul.Kv.GetOptions;
  type: Function;
  property: string;
  transformer?: <T>(value: any) => T;
};

@Injectable()
export class ConsulMetadataAccessor {
  getKeyValueMetadata(target: Function): ConsulKeyValueOptions[] | undefined {
    return Reflect.getMetadata(CONSUL_KEY_VALUE, target);
  }
}
