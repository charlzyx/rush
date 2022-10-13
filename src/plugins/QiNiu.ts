import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { store } from '@/store';
import { notify } from '@/utils/notify';
import tiny from '@mxsir/image-tiny';
import { invoke } from '@tauri-apps/api';
import dayjs from 'dayjs';
import * as qiniu from 'qiniu-js';
import { TINY_SUPPORTE } from './config';
import { Plugin, PluginConfigSchemaItem } from './Plugin';

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
  supported: Record<'upload' | 'sync' | 'remove', boolean> = {
    upload: true,
    remove: true,
    sync: false,
  };
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
    {
      label: 'accessKey',
      name: 'accessKey',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E4%B8%83%E7%89%9B%E5%9B%BE%E5%BA%8A',
    },
    {
      label: 'secretKey',
      name: 'secretKey',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E4%B8%83%E7%89%9B%E5%9B%BE%E5%BA%8A',
    },
    { label: '存储空间', name: 'bucket', required: true },
    {
      label: '资源域名',
      name: 'domain',
      required: false,
      help: '虽然 上传不是必须的, 但是没有的话, 无法预览图片',
    },
    {
      label: '上传服务器',
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
      label: '是否使用 CDN 域名',
      name: 'useCdnDomain',
      dataSource: [
        { label: '否', value: 'NO' },
        { label: '是', value: 'YES' },
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

  /**
   * 垃圾, 只有本地删除
   */
  async remove(item: StoreItem): Promise<boolean> {
    // const region = (qiniu.region as any)[this.config.region] ?? qiniu.region.z0;
    // const extra = JSON.parse(item.extra || '{}');
    // const url = await qiniu.getUploadUrl(
    //   {
    //     region,
    //   },
    //   this.TOKEN.token,
    // );
    // console.log('qiniu url', url, extra, item);
    // const ret = await fetch(`${url}/${encodeURI(extra.key)}`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   body: '',
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //     Authorization: `token ${this.TOKEN.token}`,
    //   },
    // }).then((resp) => {
    //   if (!resp.ok) {
    //     throw resp.status;
    //   }
    // });
    // console.log('qiniu delete', ret);
    await DB.remove(item);
    return Promise.resolve(true);
  }

  // https://github.com/PicGo/PicGo-Core/blob/dev/src/plugins/uploader/qiniu.ts
  async upload(file: File, alias: string): Promise<StoreItem> {
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
          error(e) {
            const msg = e.message;
            notify.err('qiniu', '上传失败', msg);
          },
          complete: resolve,
        });
      } catch (error) {
        reject(error);
      }
    });

    const resp = await waiting;

    const ret: StoreItem = {
      scope: this.name,
      alias,
      name: file.name,
      hash: file.name,
      size: file.size,
      extra: JSON.stringify({
        key: resp.key,
      }),
      create_time: +new Date(),
      url: `${this.config.domain}/${resp.key}`,
    };

    return ret;
  }
}
