import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import COS from 'cos-js-sdk-v5';
import { TINY_SUPPORTE } from './config';
// import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';

export interface TxCosConfig {
  quality?: number;
  SecretKey: string;
  APPID: string;
  SecretId: string;
  Region: string;
  Prefix: string;
  Bucket: string;
  Domain?: string;
}

const loop = async (client: COS, config: TxCosConfig, Marker?: string) => {
  const resp = await client.getBucket({
    Prefix: config.Prefix,
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
    { label: '存储路径', name: 'Prefix', required: true, help: 'Prefix' },
    { label: '存储空间名', name: 'Bucket', required: true, help: 'Bucket' },
    {
      label: '空间域名',
      name: 'Domain',
      required: true,
      help: '调用操作存储桶和对象的 API 时自定义请求域名。可以使用模板，如"{Bucket}.cos.{Region}.myqcloud.com".',
      helpLink:
        'https://cloud.tencent.com/document/product/436/11459#.E4.B8.8A.E4.BC.A0.E5.AF.B9.E8.B1.A1',
    },
  ];

  constructor(config: TxCosConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.client = new COS(this.config);
  }

  async transform(file: File): Promise<File> {
    if (this.config.quality! < 100 && TINY_SUPPORTE.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    const fileName = file.name;
    const datePrefix = dayjs().format('YYYY_MM_DD_');
    const encodeName = encodeURIComponent(fileName);
    const { Bucket, Prefix = '', Region } = this.config;

    const composePrefix = `${Prefix}/${datePrefix}`.replace('//', '/');

    const remotePath = `${composePrefix}${encodeName}`.replace('//', '/');

    const answer = await this.client
      .uploadFile({
        Body: file,
        Key: remotePath,
        Region,
        Bucket,
        // SliceSize: 1024 * 1024 * 5,     /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */
      })
      .catch((e: any) => {
        console.log(e);
        notify.err('txcos', alias, `上传失败${e.message}`);
        throw e;
      });

    const ret = {
      scope: this.name,
      alias,
      size: file.size,
      extra: JSON.stringify({
        Key: remotePath,
      }),
      name: file.name,
      hash: remotePath,
      create_time: +new Date(),
      url: `https://${answer.Location}`,
    };

    return ret;
  }

  async remove(item: StoreItem): Promise<boolean> {
    const extra = parse(item.extra!);
    const { Bucket, Region } = this.config;
    // console.log('remote', item, extra, Prefix);
    try {
      await this.client?.deleteObject({
        Bucket,
        Region,
        Key: extra.Key || item.hash,
      });
    } catch (error: any) {
      notify.err('txcos', '删除失败', error?.message);
      throw error;
    } finally {
      await DB.remove(item);
    }
    return Promise.resolve(true);
  }

  async sync(alias: string) {
    const { Domain, Prefix } = this.config;
    try {
      const files = await loop(this.client!, this.config);
      files.sort((a, b) => +dayjs(a.LastModified) - +dayjs(b.LastModified));

      const items: StoreItem[] = files.map((item) => {
        return {
          scope: this.name,
          alias: alias,
          create_time: +dayjs(item.LastModified),
          name: item.Key.replace(`${Prefix}/`, ''),
          hash: `${Prefix}/${item.Key}`,
          size: parseInt(item.Size),
          url: `${Domain}/${item.Key}`,
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
