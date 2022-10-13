import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import OSS from 'ali-oss';
import { TINY_SUPPORTE } from './config';
import dayjs from 'dayjs';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';

export interface AliOssConfig {
  quality?: number;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  prefix: string;
  bucket: string;
  cdn?: string;
}

const loop = async (client: OSS, prefix: string, marker?: string) => {
  const resp = await client.list(
    { prefix, marker, 'max-keys': 1000 },
    { timeout: 100000 },
  );
  const { nextMarker, objects } = resp;
  if (nextMarker) {
    const next = await loop(client, prefix, nextMarker);
    objects.push(...next);
  }
  return objects || [];
};

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
    {
      label: 'accessKeyId',
      name: 'accessKeyId',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    {
      label: 'accessKeySecret',
      name: 'accessKeySecret',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    { label: '存储区域', name: 'region', required: true, help: 'region' },
    { label: '存储路径', name: 'prefix', required: true, help: 'prefix' },
    { label: '存储空间名', name: 'bucket', required: true, help: 'bucket' },
    {
      label: '自定义域名',
      name: 'cdn',
      required: false,
      help: '用于拼接类似 CDN 加速的域名',
    },
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

  async upload(file: File, alias: string): Promise<StoreItem> {
    const fileName = file.name;
    const datePrefix = dayjs().format('YYYY_MM_DD_');
    const encodeName = encodeURIComponent(fileName);

    const composePrefix = `${this.config.prefix}/${datePrefix}`.replace(
      '//',
      '/',
    );

    const remotePath = `${composePrefix}${encodeName}`.replace('//', '/');

    const upload = await this.client
      ?.multipartUpload(remotePath, file, {
        // progress(p, cpt, res) {
        //   // console.log({ p, cpt, res });
        // },
        parallel: 4,
        partSize: 102400 * 200,
      })
      .catch((e) => {
        const msg = e.message;
        notify.err('alioss', '上传', msg);
        throw e;
      });

    const ret = {
      scope: this.name,
      alias,
      size: file.size,
      extra: JSON.stringify(upload.data),
      name: file.name,
      hash: (upload.data as any).url,
      create_time: +new Date(),
      url: this.config.cdn
        ? `${this.config.cdn}/${upload.name}`
        : (upload.data as any).url,
    };

    return ret;
  }

  async remove(item: StoreItem): Promise<boolean> {
    const extra = parse(item.extra!);
    try {
      await this.client?.delete(extra.name);
    } catch (error: any) {
      notify.err('alioss', '删除失败', error?.message);
      throw error;
    }
    await DB.remove(item);
    return Promise.resolve(true);
  }

  async sync(alias: string) {
    const { prefix } = this.config;
    try {
      const files = await loop(this.client!, prefix);
      files.sort((a, b) => +dayjs(a.lastModified) - +dayjs(b.lastModified));

      const items: StoreItem[] = files.map((item) => {
        return {
          scope: this.name,
          alias: alias,
          create_time: +dayjs(item.lastModified),
          name: item.name,
          hash: item.url,
          size: item.size,
          url: this.config.cdn ? `${this.config.cdn}/${item.name}` : item.url,
          extra: JSON.stringify(item),
        };
      });
      await DB.sync(items);
      return {
        list: items,
        total: items.length,
      };
    } catch (error: any) {
      notify.err('alioss', '同步远程数据失败', error?.message);
      throw error;
    }
  }
}
