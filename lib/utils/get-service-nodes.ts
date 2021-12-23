import {
  ConsulNodesResponse,
  ServiceNode,
  ServiceStatus,
} from '@/interfaces/service-discovery.interface';

export const getServiceNodes = (
  nodes: ConsulNodesResponse[],
): ServiceNode[] => {
  return nodes
    .map((node) => {
      let status = ServiceStatus.CRITICAL;
      if (node.Checks.length) {
        status = ServiceStatus.PASSING;
      }
      for (let i = 0; i < node.Checks.length; i++) {
        const check = node.Checks[i];
        if (check.Status === ServiceStatus.CRITICAL) {
          status = ServiceStatus.CRITICAL;
          break;
        } else if (check.Status === ServiceStatus.WARNING) {
          status = ServiceStatus.WARNING;
          break;
        }
      }

      return { ...node, status };
    })
    .map((node) => {
      const { status, Node, Service } = node;
      const serviceNode: ServiceNode = {
        status,
        id: Node.ID,
        name: Node.Node,
        address: Service.Address,
        port: Service.Port,
        service: Service.Service,
        datacenter: Node.Datacenter,
        meta: Node.Meta,
        tags: Service.Tags || [],
      };
      return serviceNode;
    });
};
