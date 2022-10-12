import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import { invoke } from '@tauri-apps/api';
import * as qiniu from 'qiniu-js';
import dayjs from 'dayjs';
import { TINY_SUPPORTE } from './config';

export interface QiNiuConfig {
  quality: number;
  accessKey?: string;
  secretKey: string;
  region: string;
  useCdnDomain: string;
  domain: string;
  bucket: string;
}
// seconds
const ONEDAY = 60 * 60 * 24;

export class QiNiuPlugin extends Plugin {
  name = 'qiniu';
  config: QiNiuConfig = {
    ...store.get('config_current')?.qiniu,
    quality: 80,
    secure: true,
  };
  TOKEN = {
    token: '',
    expired_time: +new Date(),
  };

  static configSchema: PluginConfigSchemaItem[] = [
    { label: 'accessKey', name: 'accessKey', required: true },
    { label: 'secretKey', name: 'secretKey', required: true },
    { label: 'bucket', name: 'bucket', required: true },
    { label: 'domain', name: 'domain', required: true },
    {
      label: 'region',
      name: 'region',
      required: true,
      dataSource: Object.keys(qiniu.region).map((name) => {
        return {
          label: name,
          value: name,
        };
      }),
    },
    {
      label: 'useCdnDomain',
      name: 'useCdnDomain',
      required: true,
      dataSource: [
        { label: '是', value: 'YES' },
        { label: '否', value: 'NO' },
      ],
    },
  ];
  constructor(config: QiNiuConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.getToken();
  }

  async getToken(): Promise<string> {
    const { accessKey, secretKey, bucket } = this.config;
    const token = (await invoke('qiniu_get_token', {
      accessKey,
      secretKey,
      bucketName: bucket,
      lifeTime: ONEDAY,
    })) as string;

    this.TOKEN = {
      token,
      expired_time: dayjs().add(1, 'day').unix(),
    };

    return token;
  }

  async transform(file: File): Promise<File> {
    if (this.config.quality < 100 && TINY_SUPPORTE.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  // https://github.com/PicGo/PicGo-Core/blob/dev/src/plugins/uploader/qiniu.ts
  async upload(file: File): Promise<StoreItem> {
    const fileName = file.name;
    const encodeName = encodeURIComponent(fileName);
    const datePrefix = dayjs().format('YYYY_MM_DD_');
    const fileKey = `${datePrefix}${encodeName}`;

    if (+new Date() - this.TOKEN.expired_time < 10 * 60 * 1000) {
      await this.getToken();
    }

    const token = this.TOKEN.token;
    const waiting = new Promise<any>((resolve, reject) => {
      try {
        const region =
          (qiniu.region as any)[this.config.region] ?? qiniu.region.z0;

        const live = qiniu.upload(
          file,
          fileKey,
          token,
          {},
          {
            region,
          },
        );
        live.subscribe({
          error: reject,
          complete: resolve,
        });
      } catch (error) {
        reject(error);
      }
    });

    const resp = await waiting;

    const ret = {
      scope: this.name,
      name: file.name,
      create_time: +new Date(),
      url: `${this.config.domain}/${resp.key}`,
    };

    return ret;
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
