import { CONSUL_CLIENT } from '@/consul.constants';
import { Inject } from '@nestjs/common';

export const InjectConsul = (): ReturnType<typeof Inject> => {
  return Inject(CONSUL_CLIENT);
};
