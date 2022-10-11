import { DB } from '@/db';
import { Plugin } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/http';
import tiny from '@mxsir/image-tiny';
import md5 from 'md5';
import { store } from '@/store';
import OSS from 'ali-oss';

export interface AliOssConfig {
  quality: number;
  secure?: true;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  prefix: string;
  bucket: string;
  cdn?: string;
}

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)/;

export class AliOssPlugin extends Plugin {
  name = 'alioss';
  config: AliOssConfig = { ...store.get('config'), quality: 80, secure: true };
  client: OSS;

  constructor(config: AliOssConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.client = new OSS(this.config);
  }

  async existed(file: File) {
    const conf = store.get('config');
    const buffer = await file.arrayBuffer();
    const sign = md5(new Uint8Array(buffer));
    // const exist = await this.client.list(
    //   {
    //     'max-keys': 1,
    //     prefix: conf.prefix,
    //     marker: file.name,
    //   },
    //   {
    //     timeout: 2000,
    //   },
    // );
    // DB.exist('tiny', { md5: sign });
    // console.log('existed of ', file, exist);
    // return exist;
    return false;
  }

  async transform(file: File): Promise<File> {
    if (IMAGE_PATTERN.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const exist = await this.existed(file);
    if (exist) {
      return exist as any;
    }
    const buffer = await file.arrayBuffer();
    const sign = md5(new Uint8Array(buffer));
    const fileName = `${sign}___${file.name}`;
    const remotePath = `${this.config.prefix}/${fileName}`.replace('//', '/');

    const upload = await this.client?.multipartUpload(remotePath, file, {
      // progress(p, cpt, res) {
      //   // console.log({ p, cpt, res });
      // },
      parallel: 4,
      // 200 kb
      partSize: 102400 * 200,
    });

    const ret = {
      scope: this.name,
      name: file.name,
      createTime: +new Date(),
      md5: sign,
      url: this.config.cdn
        ? this.config.cdn + upload.name
        : (upload.data as any).url,
    };

    return ret;
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
