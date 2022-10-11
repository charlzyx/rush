import { PageQuery, PageResp, StoreItem } from '@/shared/http';
import md5 from 'md5';

export class Plugin {
  name: string = '';

  async transform(file: File): Promise<File> {
    return Promise.resolve(file);
  }

  async upload(file: File): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    return {
      name: file.name,
      createTime: +new Date(),
      md5: md5(new Uint8Array(buffer)),
      url: file.webkitRelativePath,
    };
  }

  async existed(file: File): Promise<boolean> {
    return Promise.resolve(false);
  }

  async validateConfig(config: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async query(query: PageQuery): Promise<PageResp> {
    return Promise.resolve({ total: 0, list: [] });
  }
}
