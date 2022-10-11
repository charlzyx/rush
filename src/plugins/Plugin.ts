import { PageQuery, PageResp, StoreItem } from '@/shared/http';

export interface PluginConfigSchemaItem {
  label: string;
  name: string;
  required?: boolean;
}
export class Plugin {
  name: string = '';

  static configSchema: PluginConfigSchemaItem[] = [];

  async transform(file: File): Promise<File> {
    return Promise.resolve(file);
  }

  async upload(file: File): Promise<StoreItem> {
    return {
      name: file.name,
      create_time: +new Date(),
      url: file.webkitRelativePath,
    };
  }

  async validateConfig(config: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async query(query: PageQuery): Promise<PageResp> {
    return Promise.resolve({ total: 0, list: [] });
  }
}
