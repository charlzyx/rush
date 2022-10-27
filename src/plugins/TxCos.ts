import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { store } from '@/store';
import COS from 'cos-js-sdk-v5';
import {
  CommonConfig,
  Plugin,
  PluginConfigSchemaItem,
  PluginSupported,
  compileConfig,
  getCommonConfigSchema,
} from './Plugin';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';
import { Modal } from '@arco-design/web-react';
import dayjs from 'dayjs';

export interface TxCosConfig extends CommonConfig {
  SecretKey: string;
  APPID: string;
  SecretId: string;
  Region: string;
  Bucket: string;
  // Prefix: string;
  // Domain?: string;
}

const loop = async (client: COS, config: TxCosConfig, Marker?: string) => {
  const conf = compileConfig(config);

  const resp = await client.getBucket({
    Prefix: conf.dir,
    Marker,
    Bucket: config.Bucket,
    Region: config.Region,
    MaxKeys: 1000,
  });
  const { NextMarker, Contents } = resp;
  if (NextMarker) {
    const next = await loop(client, config, NextMarker);
    Contents.push(...next);
  }
  return Contents || [];
};

export class TxCosPlugin extends Plugin {
  name = 'txcos';

  supported: PluginSupported = {
    clear: true,
    remove: true,
    sync: true,
    upload: true,
  };
  config: TxCosConfig = {
    ...store.get('config_current')?.TxCos,
    quality: 80,
    Protocol: 'https://',
  };
  client: COS;
  static configSchema: PluginConfigSchemaItem[] = [
    // SecretKey: string;
    // SecretId: string;
    // region: string;
    // prefix: string;
    // bucket: string;
    // cdn?: string;
    {
      label: 'SecretKey',
      name: 'SecretKey',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    {
      label: 'SecretId',
      name: 'SecretId',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    { label: 'APPID', name: 'APPID', required: true, help: 'APPID' },
    { label: '存储区域', name: 'Region', required: true, help: 'Region' },
    { label: '存储空间名', name: 'Bucket', required: true, help: 'Bucket' },
    ...getCommonConfigSchema({
      customUrl: 'https://{Bucket}.cos.{Region}.myqcloud.com',
    }),
  ];

  constructor(config: TxCosConfig) {
    super();
    this.config = { ...this.config, ...config };
    if (!this.config.customUrl) {
      this.config.customUrl = 'https://{Bucket}.cos.{Region}.myqcloud.com';
    }
    this.config = compileConfig(this.config);
    this.client = new COS(this.config);
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    const conf = compileConfig(this.config, file.name);
    const { Bucket, customUrl, fileName, Region, filePath, dir } = conf;

    const answer = await this.client
      .uploadFile({
        Body: file,
        Key: filePath!,
        Region,
        Bucket,
        // SliceSize: 1024 * 1024 * 5,     /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */
      })
      .catch((e: any) => {
        console.log(e);
        notify.err('txcos', alias, `上传失败${e.message}`);
        throw e;
      });

    const ret: StoreItem = {
      scope: this.name,
      alias,
      dir,
      name: fileName!,
      hash: filePath!,
      create_time: +new Date(),
      url: customUrl
        ? `${customUrl}/${filePath}`
        : `https://${answer.Location}`,
      size: file.size,
      extra: JSON.stringify({
        Key: filePath,
      }),
    };

    return ret;
  }

  async remove(item: StoreItem): Promise<boolean> {
    const extra = parse(item.extra!);
    const { Bucket, Region } = this.config;
    try {
      await this.client?.deleteObject({
        Bucket,
        Region,
        Key: extra.Key || item.hash,
      });
      await DB.remove(item);
      return Promise.resolve(true);
    } catch (error: any) {
      notify.err('txcos', item.alias, `远程删除失败: ${error?.message}`);
      const request = new Promise((resolve, reject) => {
        Modal.confirm({
          title: '要删除本地记录吗?',
          okText: '是的',
          cancelText: '算了',
          onOk: resolve,
          onCancel: reject,
        });
      });

      try {
        await request;
        await DB.remove(item);
        return true;
      } catch (e) {
        throw error;
      }
    }
  }

  async sync(alias: string) {
    const { customUrl, dir } = this.config;
    try {
      const files = await loop(this.client!, this.config);
      files.sort((a, b) => +dayjs(a.LastModified) - +dayjs(b.LastModified));

      const items: StoreItem[] = files.map((item) => {
        return {
          scope: this.name,
          alias: alias,
          create_time: +dayjs(item.LastModified),
          dir: dir!,
          name: item.Key.replace(`${dir}/`, ''),
          hash: `${item.Key}`,
          size: parseInt(item.Size),
          url: `${customUrl}/${item.Key}`,
          extra: JSON.stringify(item),
        };
      });
      await DB.sync(items);
      return {
        list: items,
        total: items.length,
      };
    } catch (error: any) {
      notify.err('txcos', '同步远程数据失败', error?.message);
      throw error;
    }
  }
}
