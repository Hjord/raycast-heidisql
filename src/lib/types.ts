export interface HeidiSession {
  name: string;
  folder?: string;
  registryPath: string;
  host: string;
  port: string;
  user: string;
  netType: number;
  lastConnect?: string;
  comment?: string;
  password?: string;
}
