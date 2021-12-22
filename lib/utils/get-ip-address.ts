import { networkInterfaces } from 'os';

export const getIPAddress = () => {
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    if (!interfaces.hasOwnProperty(devName)) {
      continue;
    }

    const networkInterface = interfaces[devName];
    for (let i = 0; i < networkInterface.length; i++) {
      const ip = networkInterface[i];
      if (ip.family === 'IPv4' && ip.address !== '127.0.0.1' && !ip.internal) {
        return ip.address;
      }
    }
  }
};
