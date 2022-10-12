import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import OSS from 'ali-oss';
import { TINY_SUPPORTE } from './config';
import dayjs from 'dayjs';

export interface AliOssConfig {
  quality?: number;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  prefix: string;
  bucket: string;
  cdn?: string;
}

export class AliOssPlugin extends Plugin {
  name = 'alioss';
  config: AliOssConfig = {
    ...store.get('config_current')?.alioss,
    quality: 80,
    secure: true,
  };
  client: OSS;
  static configSchema: PluginConfigSchemaItem[] = [
    // accessKeyId: string;
    // accessKeySecret: string;
    // region: string;
    // prefix: string;
    // bucket: string;
    // cdn?: string;
    { label: 'accessKeyId', name: 'accessKeyId', required: true },
    { label: 'accessKeySecret', name: 'accessKeySecret', required: true },
    { label: 'region', name: 'region', required: true },
    { label: 'prefix', name: 'prefix', required: true },
    { label: 'bucket', name: 'bucket', required: true },
    { label: 'cdn', name: 'cdn', required: false },
  ];

  constructor(config: AliOssConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.client = new OSS(this.config);
  }

  async transform(file: File): Promise<File> {
    if (this.config.quality! < 100 && TINY_SUPPORTE.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const fileName = file.name;
    const datePrefix = dayjs().format('YYYY_MM_DD_');
    const decodeName = decodeURIComponent(fileName);

    const composePrefix = `${this.config.prefix}/${datePrefix}`.replace(
      '//',
      '/',
    );

    const remotePath = `${composePrefix}${decodeName}`.replace('//', '/');

    const upload = await this.client?.multipartUpload(remotePath, file, {
      // progress(p, cpt, res) {
      //   // console.log({ p, cpt, res });
      // },
      parallel: 4,
      partSize: 102400 * 200,
    });

    const ret = {
      scope: this.name,
      name: file.name,
      create_time: +new Date(),
      url: this.config.cdn
        ? `${this.config.cdn}/${upload.name}`
        : (upload.data as any).url,
    };

    return ret;
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
