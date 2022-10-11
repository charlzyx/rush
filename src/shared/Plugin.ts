import { PageQuery, PageResp, StoreItem } from './http';
import md5 from 'md5';

export class Plugin {
  name: string = '';

  transform(file: File): Promise<File> {
    return Promise.resolve(file);
  }

  upload(file: File): Promise<StoreItem> {
    return file.arrayBuffer().then((buffer) => {
      return {
        name: file.name,
        createTime: +new Date(),
        md5: md5(buffer as Uint8Array),
        url: file.webkitRelativePath,
      };
    });
  }

  validateConfig(config: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  query(query: PageQuery): Promise<PageResp> {
    return Promise.resolve({ total: 0, list: [] });
  }
}
