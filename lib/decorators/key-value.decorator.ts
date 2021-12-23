import { CONSUL_KEY_VALUE } from '@/consul.constants';
import Consul from 'consul';

export function KeyValue(key: string): PropertyDecorator;
export function KeyValue(options: Consul.Kv.GetOptions): PropertyDecorator;
export function KeyValue(
  keyOrOptions: string | Consul.Kv.GetOptions,
  transformer?: <T>(value: any) => T,
): PropertyDecorator {
  return (target, property) => {
    const type = Reflect.getMetadata('design:type', target, property);
    let properties =
      Reflect.getMetadata(CONSUL_KEY_VALUE, target.constructor) || [];
    properties = [
      ...properties,
      {
        options:
          typeof keyOrOptions === 'string'
            ? { key: keyOrOptions }
            : keyOrOptions,
        type,
        property,
        transformer,
      },
    ];
    Reflect.defineMetadata(CONSUL_KEY_VALUE, properties, target.constructor);
  };
}
