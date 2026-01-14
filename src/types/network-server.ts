import { ConnectionType } from '@/types/application';

export type NetworkServer = {
  id: string;
  name: string;
  logo: string;
  description: string;
  connection_types: ConnectionType[];
};
