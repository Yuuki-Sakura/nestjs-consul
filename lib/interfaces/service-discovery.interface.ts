export interface ConsulNodesResponse {
  Node: {
    ID: string;
    Node: string;
    Address: string;
    Datacenter: string;
    TaggedAddresses: {
      lan:
        | {
            address: string;
            port: number;
          }
        | string;
      wan:
        | {
            address: string;
            port: number;
          }
        | string;
    };
    Meta: Record<string, string>;
  };
  Service: {
    ID: string;
    Service: string;
    Tags: string[];
    Address: string;
    TaggedAddresses: {
      lan:
        | {
            address: string;
            port: number;
          }
        | string;
      wan:
        | {
            address: string;
            port: number;
          }
        | string;
    };
    Meta: Record<string, string>;
    Port: number;
    Weights: {
      Passing: number;
      Warning: number;
    };
    Namespace: string;
  };
  Checks: {
    Node: string;
    CheckID: string;
    Name: string;
    Status: string;
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
    Namespace: string;
  }[];
}

export enum ServiceStatus {
  CRITICAL = 'critical',
  PASSING = 'passing',
  WARNING = 'warning',
}

export interface ServiceNode {
  status: ServiceStatus;
  id: string;
  service: string;
  name: string;
  address: string;
  port: number;
  meta: Record<string, string>;
  datacenter: string;
  tags?: string[];
}
