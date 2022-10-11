import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/http';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import * as qiniu from 'qiniu-js';

export interface QiNiuConfig {
  quality: number;
  accessKey?: string;
  secretKey: string;
  area: string;
  url: string;
  bucket: string;
  path: string;
}

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)/;

export class QiNiuPlugin extends Plugin {
  name = 'QiNiu';
  config: QiNiuConfig = {
    ...store.get('config_current')?.qiniu,
    quality: 80,
    secure: true,
  };
  client: any;

  static configSchema: PluginConfigSchemaItem[] = [
    { label: 'accessKey', name: 'accessKey', required: true },
    { label: 'secretKey', name: 'secretKey', required: true },
    { label: 'area', name: 'area', required: true },
    { label: 'url', name: 'url', required: true },
    { label: 'bucket', name: 'bucket', required: true },
    { label: 'path', name: 'path', required: false },
  ];
  constructor(config: QiNiuConfig) {
    super();
    this.config = { ...this.config, ...config };
    // this.client = new OSS(this.config);
  }

  getToken(): string {
    const accessKey = this.config.accessKey;
    const secretKey = this.config.secretKey;
    // const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
      scope: this.client.bucket,
    };
    // const putPolicy = new qiniu.rs.PutPolicy(options);
    // return putPolicy.uploadToken(mac);
    // qiniu.getUploadUrl(this.config, '');
    return '';
  }

  async transform(file: File): Promise<File> {
    if (IMAGE_PATTERN.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  // https://github.com/PicGo/PicGo-Core/blob/dev/src/plugins/uploader/qiniu.ts
  async upload(file: File): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    const fileName = file.name;
    const remotePath = `${this.config.path}/${fileName}`.replace('//', '/');

    const area = 'z0';
    const token = this.getToken();
    const options = {
      method: 'POST',
      url: `http://upload${area}.qiniup.com/putb64/-1/key/${remotePath}`,
      headers: {
        Authorization: `UpToken ${token}`,
        contentType: 'application/octet-stream',
      },
      body: file.stream() as any,
      // body: buffer,
    };
    const ret = await (await fetch(options as any)).json();
    console.log('ret', ret);

    // const upload = await this.client?.multipartUpload(remotePath, file, {
    //   // progress(p, cpt, res) {
    //   //   // console.log({ p, cpt, res });
    //   // },
    //   parallel: 4,
    //   // 200 kb
    //   partSize: 102400 * 200,
    // });

    // const ret = {
    //   scope: this.name,
    //   name: file.name,
    //   create_time: +new Date(),
    //   url: (upload.data as any).url,
    // };

    return ret;
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
