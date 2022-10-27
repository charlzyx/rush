import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { store } from '@/store';
import { notify } from '@/utils/notify';
import { invoke } from '@tauri-apps/api';
import dayjs from 'dayjs';
import * as qiniu from 'qiniu-js';
import {
  CommonConfig,
  Plugin,
  PluginConfigSchemaItem,
  PluginSupported,
  compileConfig,
  getCommonConfigSchema,
} from './Plugin';

export interface QiNiuConfig extends CommonConfig {
  accessKey?: string;
  secretKey: string;
  region: string;
  useCdnDomain: string;
  bucket: string;
}
// seconds
const ONEDAY = 60 * 60 * 24;

export class QiNiuPlugin extends Plugin {
  name = 'qiniu';
  supported: PluginSupported = {
    upload: true,
    clear: true,
    remove: false,
    sync: false,
  };
  config: QiNiuConfig = {
    ...store.get('config_current')?.qiniu,
    quality: 80,
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
    ...getCommonConfigSchema(),
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
    this.config = compileConfig({ ...this.config, ...config });
    const region = (qiniu.region as any)[this.config.region] ?? qiniu.region.z0;
    this.config.region = region;
    this.getToken();
  }

  async getToken(): Promise<string> {
    const { accessKey, secretKey, bucket } = this.config;
    try {
      const token = (await invoke('qiniu_get_token', {
        accessKey,
        secretKey,
        bucketName: bucket,
        lifeTime: ONEDAY,
      })) as string;

      this.TOKEN = {
        token,
        expired_time: +dayjs().add(1, 'day'),
      };

      return token;
    } catch (error) {
      return '';
    }
  }

  /**
   * 垃圾, 只有本地删除
   */
  async remove(item: StoreItem): Promise<boolean> {
    await DB.remove(item);
    return Promise.resolve(true);
  }

  // https://github.com/PicGo/PicGo-Core/blob/dev/src/plugins/uploader/qiniu.ts
  async upload(file: File, alias: string): Promise<StoreItem> {
    const conf = compileConfig(this.config, file.name);
    const { customUrl, dir, filePath, fileName } = conf;

    if (+new Date() - this.TOKEN.expired_time < 10 * 60 * 1000) {
      await this.getToken();
    }

    const token = this.TOKEN.token;
    const query = new Promise<any>((resolve, reject) => {
      try {
        const region =
          (qiniu.region as any)[this.config.region] ?? qiniu.region.z0;

        const live = qiniu.upload(
          file,
          filePath,
          token,
          {},
          {
            region,
          },
        );
        live.subscribe({
          error(e) {
            const msg = e.message;
            notify.err('qiniu', alias, `上传失败:${msg}`);
          },
          complete: resolve,
        });
      } catch (error) {
        reject(error);
      }
    });

    const resp = await query;

    const ret: StoreItem = {
      scope: this.name,
      alias,
      dir,
      name: fileName!,
      hash: filePath!,
      size: file.size,
      url: `${customUrl || 'https://qiniu.com'}/${resp.key}`,
      extra: JSON.stringify({
        key: resp.key,
      }),
      create_time: +new Date(),
    };

    return ret;
  }
}
